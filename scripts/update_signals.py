#!/usr/bin/env python3
"""Track open signals every run and issue a new daily signal when the rules pass.

Hourly runs update floating pips and close trades whose intraday high/low has
touched the target or the stop. A new signal is considered once per Baghdad
day, on the first successful run at or after 08:00 UTC, and only for pairs
with no open signal. Set FORCE_ISSUE=1 to run that pass immediately.
Set PAUSE_ISSUE=1 to keep tracking and the calendar running without opening
anything new. A paused run still updates open signals.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (
    DATA,
    ISSUE_HOUR_UTC,
    PAIRS,
    Decision,
    FetchError,
    Fundamentals,
    apply_macro,
    calendar_fundamentals,
    completed,
    evaluate_pair,
    fetch_headlines,
    fetch_pair_bars,
    build_progress_update,
    due_for_update,
    duration_hours,
    fetch_yahoo,
    floating_pips,
    iso_z,
    issuance_block,
    last_valid,
    load_events_from_disk,
    load_json,
    market_closed,
    merge_closed,
    parse_dt,
    resolve_exit,
    round_px,
    rsi,
    scan_row,
    score_headlines,
    utc_now,
    write_if_content_changed,
    baghdad_date,
)


def should_issue(now: datetime, state: dict) -> bool:
    if os.environ.get("PAUSE_ISSUE") == "1":
        return False
    if os.environ.get("FORCE_ISSUE") == "1":
        return True
    if now.astimezone(timezone.utc).hour < ISSUE_HOUR_UTC:
        return False
    return state.get("lastIssueDate") != baghdad_date(now)


def quote_from_bars(pair: str, bars: list) -> tuple[float, str]:
    price = round_px(pair, bars[-1].close)
    as_of = iso_z(datetime.fromtimestamp(bars[-1].ts + 3600, timezone.utc))
    return price, as_of


def track(open_signals: list[dict], now: datetime) -> tuple[list[dict], list[dict], bool]:
    now_ts = int(now.timestamp())
    still: list[dict] = []
    closed: list[dict] = []
    changed = False
    for signal in open_signals:
        pair = signal["pair"]
        try:
            bars = completed(fetch_yahoo(f"{pair}=X", "1h", "3mo"), 3600, now_ts)
        except FetchError as exc:
            print(f"TRACK {pair} price failed: {exc}")
            still.append(signal)
            continue
        if not bars:
            still.append(signal)
            continue
        ready = int(signal.get("entryReadyTs") or parse_dt(signal["issuedAt"]).timestamp())
        outcome = resolve_exit(signal["direction"], ready, signal["sl"], signal["tp"], bars)
        price, as_of = quote_from_bars(pair, bars)
        rsi_now = last_valid(rsi([bar.close for bar in bars]))
        events = load_events_from_disk()

        def with_update(base: dict, mark: float) -> dict:
            if not due_for_update(base, now):
                return base
            note = build_progress_update(base, mark, now, rsi_now, events)
            cloned = dict(base)
            cloned["updates"] = [*(base.get("updates") or []), note]
            print(f"UPDATE {pair} {note['baghdad']} {note['floatingPips']} pips {note['progressToTp']}% to TP")
            return cloned

        if outcome:
            result, close_price, closed_at = outcome
            done = with_update(signal, close_price)
            done["status"] = "closed"
            done["result"] = result
            done["closePrice"] = close_price
            done["closedAt"] = closed_at
            done["currentPrice"] = close_price
            done["priceAsOf"] = closed_at
            done["pips"] = floating_pips(pair, signal["direction"], signal["entry"], close_price)
            done["floatingPips"] = done["pips"]
            done["durationHours"] = duration_hours(signal["issuedAt"], closed_at)
            closed.append(done)
            changed = True
            print(f"CLOSE {pair} {result} {done['pips']} pips at {closed_at}")
            continue
        pips = floating_pips(pair, signal["direction"], signal["entry"], price)
        refreshed = with_update(signal, price)
        price_changed = (
            signal.get("currentPrice") != price
            or signal.get("floatingPips") != pips
            or signal.get("priceAsOf") != as_of
        )
        if price_changed or refreshed is not signal and refreshed.get("updates") != signal.get("updates"):
            refreshed["currentPrice"] = price
            refreshed["floatingPips"] = pips
            refreshed["priceAsOf"] = as_of
            still.append(refreshed)
            changed = True
            print(f"MARK {pair} {price} floating {pips} pips")
        else:
            still.append(signal)
            print(f"MARK {pair} unchanged {price}")
    return still, closed, changed


def build_fundamentals(now: datetime) -> Fundamentals:
    events = load_events_from_disk()
    surprises, examples, upcoming = calendar_fundamentals(events, now)
    items, used, failed = fetch_headlines()
    sentiment, counts, headlines = score_headlines(items)
    sources = ["Yahoo Finance", "Forex Factory"]
    if any(event.get("actualSource") == "TradingView" for event in events):
        sources.append("TradingView")
    sources.extend(used)
    print(f"HEADLINES used: {', '.join(used) or 'none'}")
    for item in failed:
        print(f"HEADLINES failed: {item['source']}: {item['error']}")
    fund = Fundamentals(
        sentiment=sentiment,
        counts=counts,
        surprises=surprises,
        examples=examples,
        next_events=upcoming,
        sources=sources,
        failed=failed,
        now=now,
        headline_examples=headlines,
    )
    # The stored TradingView history replaces the one-week surprise window. Headlines stay.
    return apply_macro(fund, now)


def skip_decision(pair: str, block: str, en: str, ar: str, snapshot: dict | None = None) -> Decision:
    return Decision(pair=pair, block=block, summary_en=en, summary_ar=ar, snapshot=snapshot or {})


def main() -> int:
    now = utc_now()
    signals_path = DATA / "signals.json"
    history_path = DATA / "history.json"
    state = load_json(signals_path) or {}
    history_state = load_json(history_path) or {"closed": []}
    open_signals = list(state.get("open") or [])
    history = list(history_state.get("closed") or [])

    issue = should_issue(now, state)
    print(f"now {iso_z(now)} issue_pass={issue} market_closed={market_closed(now)} open={len(open_signals)}")

    if not open_signals and not issue:
        print("idle: no open signals and the daily issue window is not due")
        return 0

    open_signals, newly_closed, tracked = track(open_signals, now)
    history = merge_closed(history, newly_closed)

    if issue:
        fund = build_fundamentals(now)
        decisions: list[Decision] = []
        priced = 0
        for pair in PAIRS:
            block = issuance_block(pair, open_signals, history, now)
            if block == "open":
                current = next(item for item in open_signals if item["pair"] == pair)
                decisions.append(
                    skip_decision(
                        pair,
                        "open",
                        f"Open {current['direction']} from {current['issuedAt']} stays active until stop {current['sl']} or target {current['tp']}.",
                        f"إشارة {current['direction']} المفتوحة منذ {current['issuedAt']} تبقى حتى الإيقاف {current['sl']} أو الهدف {current['tp']}.",
                        {
                            "price": current.get("currentPrice"),
                            "priceAsOf": current.get("priceAsOf"),
                            "dailyTrend": current["direction"].lower(),
                            "ema20": current.get("indicators", {}).get("ema20"),
                            "ema50": current.get("indicators", {}).get("ema50"),
                            "ema200": current.get("indicators", {}).get("ema200"),
                            "rsi4h": current.get("indicators", {}).get("rsi4h"),
                            "macdHist4h": current.get("indicators", {}).get("macdHist4h"),
                            "atr4h": current.get("indicators", {}).get("atr4h"),
                        },
                    )
                )
                print(f"PAIR {pair} SKIP open")
                continue
            if block == "already-today":
                decisions.append(
                    skip_decision(
                        pair,
                        "already-today",
                        "A signal was already issued for this pair on this Baghdad date. The limit is one new signal per day.",
                        "صدرت إشارة لهذا الزوج في تاريخ بغداد الحالي. الحد هو إشارة جديدة واحدة في اليوم.",
                    )
                )
                print(f"PAIR {pair} SKIP already-today")
                continue
            try:
                bars = fetch_pair_bars(pair, int(now.timestamp()))
            except FetchError as exc:
                decisions.append(
                    skip_decision(
                        pair,
                        "no-data",
                        f"Price history could not be loaded ({exc}).",
                        f"تعذر تحميل تاريخ السعر ({exc}).",
                    )
                )
                print(f"PAIR {pair} SKIP no-data {exc}")
                continue
            priced += 1
            decision = evaluate_pair(pair, bars["1d"], bars["4h"], bars["1h"], fund, now)
            decisions.append(decision)
            if decision.signal:
                decision.signal["entryReadyTs"] = int(parse_dt(decision.signal["priceAsOf"]).timestamp())
                open_signals.append(decision.signal)
                print(
                    f"SIGNAL {pair} {decision.signal['direction']} entry {decision.signal['entry']} "
                    f"sl {decision.signal['sl']} tp {decision.signal['tp']} rr {decision.signal['rr']}"
                )
            else:
                print(f"PAIR {pair} SKIP {decision.block}: {decision.summary_en}")
        if priced:
            state["lastIssueDate"] = baghdad_date(now)
        state["sources"] = {
            "prices": {
                "provider": "Yahoo Finance chart API",
                "ok": priced == len(PAIRS),
                "detail": (
                    "Daily, 4h, and 1h candles from query1.finance.yahoo.com with query2 as fallback. "
                    "This is the endpoint yfinance reads. "
                    f"{priced} of {len(PAIRS)} pairs loaded."
                ),
            },
            "calendar": {
                "provider": "Forex Factory",
                "ok": bool(load_events_from_disk()),
                "detail": "data/news.json from nfs.faireconomy.media/ff_calendar_thisweek.json",
            },
            "actuals": {
                "provider": "TradingView",
                "ok": any(event.get("actualSource") == "TradingView" for event in load_events_from_disk()),
                "detail": "Matched onto Forex Factory rows. The public Forex Factory file has no actual field.",
            },
            "headlines": {"used": [source for source in fund.sources if source not in {'Yahoo Finance', 'Forex Factory', 'TradingView'}], "failed": fund.failed},
        }
        state["scan"] = [scan_row(decision) for decision in decisions]
    elif "scan" not in state:
        state["scan"] = []

    state["open"] = open_signals
    history_payload = {"updatedAt": history_state.get("updatedAt", ""), "closed": history}
    signals_changed = write_if_content_changed(signals_path, state)
    history_changed = write_if_content_changed(history_path, history_payload)
    print(f"signals.json {'updated' if signals_changed else 'unchanged'}; history.json {'updated' if history_changed else 'unchanged'}")
    print(f"open {len(open_signals)}; closed archive {len(history)}; tracked_change={tracked}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
