#!/usr/bin/env python3
"""Walk-forward replay of the live signal rules.

Uses evaluate_pair, the same stop/target geometry, one open signal per pair,
and one new signal per pair per Baghdad day at the live issue hour. Each closed trade
pays the spread (1 pip on EUR, GBP, JPY, AUD; 1.5 on NZD, CAD, CHF). The
first 70% of decision days is in-sample. The last 30% is reported separately
and is not used to pick parameters. The technical rules were already scored on this
holdout once. The fundamental gate (news surprise, not the rate path) was chosen
only on the in-sample window after that, so this holdout is a second look.

Trades still open at a period boundary are marked at the last completed hour
so the next period starts flat. Forex Factory history is not available for
this window, so the live high-impact-news block is not applied here.
"""
from __future__ import annotations

import pickle
import sys
from bisect import bisect_right
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (  # noqa: E402
    PAIRS,
    Bar,
    apply_macro,
    empty_fundamentals,
    evaluate_pair,
    fetch_yahoo,
    load_macro_tables,
    market_closed,
    pip_size,
    reconcile_daily,
    resolve_exit,
)

CACHE = Path("/tmp/fx-history-v1.pkl")
SPREAD_PIPS = {
    "EURUSD": 1.0,
    "GBPUSD": 1.0,
    "USDJPY": 1.0,
    "AUDUSD": 1.0,
    "NZDUSD": 1.5,
    "USDCAD": 1.5,
    "USDCHF": 1.5,
    "EURGBP": 1.5,
    "EURJPY": 2.0,
    "EURCAD": 2.5,
    "GBPJPY": 2.5,
    "GBPAUD": 3.0,
    "GBPCAD": 3.0,
    "GBPNZD": 4.0,
}
from fps_lib import ISSUE_HOUR_UTC as ISSUE_HOUR  # noqa: E402


def _completed(bars: list[Bar], interval: int, now_ts: int) -> list[Bar]:
    if not bars:
        return []
    cutoff = now_ts - interval
    index = bisect_right([bar.ts for bar in bars], cutoff)
    return bars[:index]


def load_history() -> dict[str, dict[str, list[Bar]]]:
    if CACHE.exists():
        with CACHE.open("rb") as handle:
            return pickle.load(handle)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    history: dict[str, dict[str, list[Bar]]] = {}
    for pair in PAIRS:
        symbol = f"{pair}=X"
        daily = fetch_yahoo(symbol, "1d", period1=now_ts - 1100 * 86400, period2=now_ts + 60)
        h4 = fetch_yahoo(symbol, "4h", period1=now_ts - 450 * 86400, period2=now_ts + 60)
        h1 = fetch_yahoo(symbol, "1h", period1=now_ts - 450 * 86400, period2=now_ts + 60)
        history[pair] = {"1d": _dedupe(daily), "4h": _dedupe(h4), "1h": _dedupe(h1)}
        print(f"fetched {pair} daily={len(daily)} 4h={len(h4)} 1h={len(h1)}", flush=True)
    with CACHE.open("wb") as handle:
        pickle.dump(history, handle)
    return history


def _dedupe(bars: list[Bar]) -> list[Bar]:
    by_ts: dict[int, Bar] = {}
    for bar in bars:
        by_ts[bar.ts] = bar
    return [by_ts[key] for key in sorted(by_ts)]


def decision_days(history: dict, start: datetime, end: datetime) -> list[datetime]:
    days: list[datetime] = []
    cursor = start
    while cursor <= end:
        if cursor.weekday() < 5 and not market_closed(cursor):
            ts = int(cursor.timestamp())
            ready = True
            for bars in history.values():
                if len(_completed(bars["4h"], 4 * 3600, ts)) < 220:
                    ready = False
                    break
                if len(_completed(bars["1d"], 86400, ts)) < 210:
                    ready = False
                    break
                if not _completed(bars["1h"], 3600, ts):
                    ready = False
                    break
            if ready:
                days.append(cursor)
        cursor += timedelta(days=1)
    return days


def _view(bars: dict[str, list[Bar]], ts: int) -> tuple[list[Bar], list[Bar], list[Bar]]:
    daily = _completed(bars["1d"], 86400, ts)
    h4 = _completed(bars["4h"], 4 * 3600, ts)
    h1 = _completed(bars["1h"], 3600, ts)
    return reconcile_daily(daily, h4), h4, h1


def replay(history: dict, days: list[datetime], boundary: datetime, label: str, fund_for=None) -> list[dict]:
    """Replay one period. Open trades are marked at `boundary` and do not cross it."""
    if not days:
        return []
    boundary_ts = int(boundary.timestamp())
    trades: list[dict] = []
    for pair in PAIRS:
        bars = history[pair]
        blocked_until: datetime | None = None
        for day in days:
            if blocked_until is not None and day < blocked_until:
                continue
            ts = int(day.timestamp())
            daily, h4, h1 = _view(bars, ts)
            fund = empty_fundamentals(day) if fund_for is None else fund_for(day)
            decision = evaluate_pair(pair, daily, h4, h1, fund, day, market_open=True)
            signal = decision.signal
            if not signal:
                continue
            trade = _open_trade(pair, signal, day)
            future = [bar for bar in bars["1h"] if bar.ts >= ts]
            resolved = resolve_exit(signal["direction"], ts, float(signal["sl"]), float(signal["tp"]), future)
            closed_at = None if not resolved else datetime.fromisoformat(resolved[2].replace("Z", "+00:00"))
            if resolved and closed_at is not None and closed_at <= boundary:
                _apply_exit(trade, resolved[0])
                blocked_until = closed_at
            else:
                _finalize(trade, bars["1h"], boundary_ts, "mark")
                blocked_until = boundary
            trades.append(trade)
    trades.sort(key=lambda item: item["issued"])
    print(f"{label} trades={len(trades)}", flush=True)
    return trades


def _open_trade(pair: str, signal: dict, day: datetime) -> dict:
    entry = float(signal["entry"])
    sl = float(signal["sl"])
    tp = float(signal["tp"])
    risk = abs(entry - sl)
    pip = pip_size(pair)
    return {
        "pair": pair,
        "direction": signal["direction"],
        "entry": entry,
        "sl": sl,
        "tp": tp,
        "rr": float(signal["rr"]),
        "issued": day,
        "risk_pips": risk / pip,
        "spread": SPREAD_PIPS[pair],
        "result": "open",
        "net_pips": 0.0,
        "net_r": 0.0,
    }


def _apply_exit(trade: dict, result: str) -> None:
    trade["result"] = result
    pips = trade["risk_pips"] * trade["rr"] if result == "TP" else -trade["risk_pips"]
    trade["net_pips"] = pips - trade["spread"]
    trade["net_r"] = trade["net_pips"] / trade["risk_pips"] if trade["risk_pips"] else 0.0


def _finalize(trade: dict, h1: list[Bar], ts: int, result: str) -> None:
    done = _completed(h1, 3600, ts)
    price = done[-1].close if done else trade["entry"]
    sign = 1 if trade["direction"] == "BUY" else -1
    pip = pip_size(trade["pair"])
    gross = (price - trade["entry"]) * sign / pip
    trade["result"] = result
    trade["net_pips"] = gross - trade["spread"]
    trade["net_r"] = trade["net_pips"] / trade["risk_pips"] if trade["risk_pips"] else 0.0


def summarize(trades: list[dict]) -> dict:
    if not trades:
        return {
            "n": 0, "wins": 0, "losses": 0, "win_rate": 0.0, "avg_rr": 0.0,
            "net_pips": 0.0, "net_r": 0.0, "profit_factor": 0.0, "profit_factor_r": 0.0,
            "max_streak": 0, "max_dd_r": 0.0,
        }
    wins = [trade for trade in trades if trade["net_pips"] > 0]
    losses = [trade for trade in trades if trade["net_pips"] <= 0]
    gain = sum(trade["net_pips"] for trade in wins)
    pain = abs(sum(trade["net_pips"] for trade in losses))
    gain_r = sum(trade["net_r"] for trade in wins)
    pain_r = abs(sum(trade["net_r"] for trade in losses))
    streak = worst = 0
    equity = peak = 0.0
    drawdown = 0.0
    ordered = sorted(trades, key=lambda item: item["issued"])
    for trade in ordered:
        if trade["net_pips"] <= 0:
            streak += 1
            worst = max(worst, streak)
        else:
            streak = 0
        equity += trade["net_r"]
        peak = max(peak, equity)
        drawdown = max(drawdown, peak - equity)
    return {
        "n": len(trades),
        "wins": len(wins),
        "losses": len(losses),
        "win_rate": 100.0 * len(wins) / len(trades),
        "avg_rr": sum(trade["rr"] for trade in trades) / len(trades),
        "net_pips": sum(trade["net_pips"] for trade in trades),
        "net_r": sum(trade["net_r"] for trade in trades),
        "profit_factor": (gain / pain) if pain else float("inf"),
        "profit_factor_r": (gain_r / pain_r) if pain_r else float("inf"),
        "max_streak": worst,
        "max_dd_r": drawdown,
    }


def render(title: str, trades: list[dict], weeks: float) -> str:
    lines = [title, "pair      n   wins  loss   win%   avgRR    net pips    net R    PFpips    PFr  streak   maxDD R"]
    groups = [pair for pair in PAIRS if any(trade["pair"] == pair for trade in trades)]
    for pair in groups + ["ALL"]:
        subset = trades if pair == "ALL" else [trade for trade in trades if trade["pair"] == pair]
        stats = summarize(subset)
        per_week = stats["n"] / weeks if weeks and pair == "ALL" else 0.0
        lines.append(
            f"{pair:<8} {stats['n']:3d} {stats['wins']:5d} {stats['losses']:5d} "
            f"{stats['win_rate']:6.1f} {stats['avg_rr']:7.2f} {stats['net_pips']:10.1f} "
            f"{stats['net_r']:8.2f} {stats['profit_factor']:7.2f} {stats['profit_factor_r']:6.2f} "
            f"{stats['max_streak']:6d} {stats['max_dd_r']:8.2f}"
            + (f"   {per_week:.2f}/week" if pair == "ALL" else "")
        )
    if not groups:
        lines.append("(no trades)")
    return "\n".join(lines)


def main() -> int:
    history = load_history()
    first_bar = min(bars["4h"][0].ts for bars in history.values())
    last_bar = max(bars["1h"][-1].ts for bars in history.values())
    start = datetime.fromtimestamp(first_bar, timezone.utc).replace(hour=ISSUE_HOUR, minute=0, second=0, microsecond=0)
    end = datetime.fromtimestamp(last_bar, timezone.utc).replace(hour=ISSUE_HOUR, minute=0, second=0, microsecond=0)
    if end > datetime.now(timezone.utc):
        end = datetime.now(timezone.utc).replace(hour=ISSUE_HOUR, minute=0, second=0, microsecond=0)
    days = decision_days(history, start, end - timedelta(days=1))
    if len(days) < 20:
        print("not enough decision days")
        return 1
    split = int(len(days) * 0.70)
    sample = days[:split]
    holdout = days[split:]
    print(
        f"window {days[0].date().isoformat()} .. {days[-1].date().isoformat()} "
        f"days={len(days)} in-sample={len(sample)} ({sample[0].date()}..{sample[-1].date()}) "
        f"out-of-sample={len(holdout)} ({holdout[0].date()}..{holdout[-1].date()})"
    )
    events, banks = load_macro_tables()

    def fund_for(day: datetime):
        return apply_macro(empty_fundamentals(day), day, events, banks)

    ins = replay(history, sample, holdout[0], "in-sample", fund_for)
    oos_boundary = datetime.fromtimestamp(last_bar, timezone.utc)
    oos = replay(history, holdout, oos_boundary, "out-of-sample", fund_for)
    in_weeks = max((sample[-1] - sample[0]).days / 7, 0.1)
    out_weeks = max((holdout[-1] - holdout[0]).days / 7, 0.1)
    print(render("IN-SAMPLE", ins, in_weeks))
    print(render("OUT-OF-SAMPLE", oos, out_weeks))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
