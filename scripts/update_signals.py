#!/usr/bin/env python3
"""Track open signals every run and issue a new daily signal when the rules pass.

Hourly runs update floating pips and close trades whose intraday high/low has
touched the target or the stop. New signals are scanned for at each session
open: Frankfurt, London and New York at 08:00 local time (DST-aware), within
SESSION_WINDOW_MINUTES of the open. A pair still gets at most one new signal
per Baghdad day, and none while it has an open signal. Set FORCE_ISSUE=1 to run that pass immediately.
Set PAUSE_ISSUE=1 to keep tracking and the calendar running without opening
anything new. A paused run still updates open signals.

Yahoo candles stay the price history. When Yahoo does not return a current
price, the Coinbase spot is stored instead and the source is recorded. A spot
quote does not become candles, and it does not open or close a signal.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (
    DATA,
    due_sessions,
    PAIRS,
    NO_ISSUE_PAIRS,
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
    fetch_coinbase_spot,
    fetch_yahoo,
    floating_pips,
    fmt_px,
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


def due_session(now: datetime, state: dict) -> str | None:
    """Name of a session open that has not been scanned yet, or "manual" when forced."""
    if os.environ.get("PAUSE_ISSUE") == "1":
        return None
    if os.environ.get("FORCE_ISSUE") == "1":
        return "manual"
    if market_closed(now):
        return None
    scans = state.get("sessionScans") or {}
    for name, local_date in due_sessions(now):
        if scans.get(name) != local_date:
            return name
    return None


def should_issue(now: datetime, state: dict) -> bool:
    return due_session(now, state) is not None


def mark_session(now: datetime, state: dict, session: str) -> None:
    if session == "manual":
        return
    scans = dict(state.get("sessionScans") or {})
    for name, local_date in due_sessions(now):
        if name == session:
            scans[name] = local_date
    state["sessionScans"] = scans


def quote_from_bars(pair: str, bars: list) -> tuple[float, str]:
    price = round_px(pair, bars[-1].close)
    as_of = iso_z(datetime.fromtimestamp(bars[-1].ts + 3600, timezone.utc))
    return price, as_of


def price_report(issuing_pairs: list[str], quotes: dict[str, str]) -> dict:
    """Health for sources.prices. ok when every issuing pair has a price this run.

    `quotes` maps a pair to "Yahoo Finance" or "Coinbase". A pair left out has
    no price. Coinbase is a spot fallback and is named in the detail.
    """
    fallbacks = [pair for pair in issuing_pairs if quotes.get(pair) == "Coinbase"]
    missing = [pair for pair in issuing_pairs if pair not in quotes]
    priced = len(issuing_pairs) - len(missing)
    parts = [
        "Daily, 4h, and 1h candles from query1.finance.yahoo.com with query2 as fallback. "
        "This is the endpoint yfinance reads. "
        f"{priced} of {len(issuing_pairs)} issuing pairs have a price."
    ]
    if fallbacks:
        parts.append(
            "Coinbase spot fallback for "
            + ", ".join(fallbacks)
            + ". Yahoo candles were unavailable for those pairs, so the spot price is recorded and no signal is built from it."
        )
    if missing:
        parts.append("No price for " + ", ".join(missing) + ".")
    return {
        "provider": "Yahoo Finance chart API",
        "ok": not missing,
        "detail": " ".join(parts),
        "fallback": fallbacks,
    }


def status_quote(pair: str, now: datetime) -> tuple[str | None, float | None, str | None]:
    """Latest price for a pair that will not be issued. Yahoo 1h candles, else Coinbase spot."""
    now_ts = int(now.timestamp())
    try:
        bars = completed(fetch_yahoo(f"{pair}=X", "1h", "5d"), 3600, now_ts)
    except FetchError as exc:
        print(f"PAIR {pair} Yahoo candles failed: {exc}")
        bars = []
    if bars:
        price, as_of = quote_from_bars(pair, bars)
        return "Yahoo Finance", price, as_of
    spot = fetch_coinbase_spot(pair)
    if spot is None:
        return None, None, None
    print(f"PAIR {pair} current price from Coinbase spot")
    return "Coinbase", round_px(pair, spot), iso_z(now)


def apply_spot_mark(signal: dict, price: float, as_of: str, now: datetime) -> dict:
    """Store a Coinbase spot on an open signal. Does not close the trade or invent candles."""
    pair = signal["pair"]
    pips = floating_pips(pair, signal["direction"], signal["entry"], price)
    refreshed = dict(signal)
    refreshed["currentPrice"] = price
    refreshed["floatingPips"] = pips
    refreshed["priceAsOf"] = as_of
    refreshed["priceSource"] = "Coinbase"
    if due_for_update(signal, now):
        note = build_progress_update(signal, price, now, None, load_events_from_disk())
        refreshed["updates"] = [*(signal.get("updates") or []), note]
        print(f"UPDATE {pair} {note['baghdad']} {note['floatingPips']} pips {note['progressToTp']}% to TP (spot)")
    return refreshed


def track(open_signals: list[dict], now: datetime) -> tuple[list[dict], list[dict], bool, dict[str, str]]:
    """Track open signals. The dict maps each pair priced this run to its source."""
    now_ts = int(now.timestamp())
    still: list[dict] = []
    closed: list[dict] = []
    changed = False
    quoted: dict[str, str] = {}
    for signal in open_signals:
        pair = signal["pair"]
        try:
            bars = completed(fetch_yahoo(f"{pair}=X", "1h", "3mo"), 3600, now_ts)
        except FetchError as exc:
            print(f"TRACK {pair} Yahoo candles failed: {exc}")
            bars = []
        if not bars:
            spot = fetch_coinbase_spot(pair)
            if spot is None:
                print(f"TRACK {pair} price failed: Yahoo candles missing and Coinbase spot unavailable")
                still.append(signal)
                continue
            price = round_px(pair, spot)
            quoted[pair] = "Coinbase"
            refreshed = apply_spot_mark(signal, price, iso_z(now), now)
            still.append(refreshed)
            changed = True
            print(f"MARK {pair} {price} from Coinbase spot (Yahoo candles unavailable) floating {refreshed['floatingPips']} pips")
            continue
        quoted[pair] = "Yahoo Finance"
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
            done["priceSource"] = "Yahoo Finance"
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
            or signal.get("priceSource") != "Yahoo Finance"
        )
        if price_changed or refreshed is not signal and refreshed.get("updates") != signal.get("updates"):
            refreshed["currentPrice"] = price
            refreshed["floatingPips"] = pips
            refreshed["priceAsOf"] = as_of
            refreshed["priceSource"] = "Yahoo Finance"
            still.append(refreshed)
            changed = True
            print(f"MARK {pair} {price} floating {pips} pips")
        else:
            still.append(signal)
            print(f"MARK {pair} unchanged {price}")
    return still, closed, changed, quoted


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


def load_analyst_bias() -> dict:
    """Daily analyst bias per pair, written from the owner's Autochartist (IC Markets) email."""
    path = DATA / "analyst_bias.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


# Saif (2026-11-11): signals rely on news, fundamentals and the strategy only; the analyst gate is off.
ANALYST_GATE_ENABLED = False


def apply_analyst_gate(decision: Decision, analyst: dict, now: datetime) -> Decision:
    """Keep a signal only when today's analyst report gives the same direction for the pair."""
    if not ANALYST_GATE_ENABLED or not decision.signal:
        return decision
    pair = decision.pair
    direction = decision.signal["direction"].upper()
    entry = (analyst.get("pairs") or {}).get(pair) or {}
    bias = str(entry.get("bias", "")).upper()
    if analyst.get("date") != baghdad_date(now):
        en = "Today's analyst report has not been read yet, so the signal is held back."
        ar = "لم يُقرأ تقرير التحليل اليومي بعد، لذلك لم تُنشر الإشارة."
    elif bias not in {"BUY", "SELL"}:
        en = f"The rules gave a {direction}, but today's analyst report has no clear direction for {pair}."
        ar = f"القواعد أعطت {direction}، لكن تقرير التحليل اليوم لا يعطي اتجاهاً واضحاً لـ {pair}."
    elif bias != direction:
        en = f"The rules gave a {direction}, but today's analyst report is {bias} on {pair}."
        ar = f"القواعد أعطت {direction}، لكن تقرير التحليل اليوم {bias} على {pair}."
    else:
        decision.signal["analyst"] = {
            "source": analyst.get("source", "Autochartist"),
            "date": analyst.get("date"),
            "bias": bias,
            "note": entry.get("note", ""),
        }
        return decision
    return Decision(pair=pair, block="analyst", summary_en=en, summary_ar=ar, snapshot=decision.snapshot)


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

    session = due_session(now, state)
    issue = session is not None
    print(f"now {iso_z(now)} issue_pass={issue} session={session} market_closed={market_closed(now)} open={len(open_signals)}")

    if not open_signals and not issue:
        print("idle: no open signals and no session scan is due")
        return 0

    open_signals, newly_closed, tracked, quoted = track(open_signals, now)
    history = merge_closed(history, newly_closed)

    if issue:
        fund = build_fundamentals(now)
        analyst = load_analyst_bias()
        decisions: list[Decision] = []
        quotes: dict[str, str] = {}
        # Candle loads mark the session as scanned. An open pair is priced in track()
        # and counted in `quotes`, but it is not fetched again here.
        candle_loads = 0
        for pair in PAIRS:
            if pair in NO_ISSUE_PAIRS:
                decisions.append(
                    skip_decision(
                        pair,
                        "disabled",
                        "New signals on this pair are switched off after weak backtest results.",
                        "توصيات هذا الزوج متوقفة بعد نتائج ضعيفة في الاختبار التاريخي.",
                    )
                )
                print(f"PAIR {pair} SKIP disabled")
                continue
            block = issuance_block(pair, open_signals, history, now)
            if block == "open":
                current = next(item for item in open_signals if item["pair"] == pair)
                source = quoted.get(pair)
                if source:
                    quotes[pair] = source
                decisions.append(
                    skip_decision(
                        pair,
                        "open",
                        f"Open {current['direction']} from {current['issuedAt']} stays active until stop {current['sl']} or target {current['tp']}.",
                        f"إشارة {current['direction']} المفتوحة منذ {current['issuedAt']} تبقى حتى الإيقاف {current['sl']} أو الهدف {current['tp']}.",
                        {
                            "price": current.get("currentPrice"),
                            "priceAsOf": current.get("priceAsOf"),
                            "priceSource": source,
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
                print(f"PAIR {pair} SKIP open; price {current.get('currentPrice')} from {source or 'unpriced'}")
                continue
            if block == "already-today":
                source, price, as_of = status_quote(pair, now)
                snapshot: dict = {}
                if source and price is not None:
                    quotes[pair] = source
                    snapshot = {"price": price, "priceAsOf": as_of, "priceSource": source}
                decisions.append(
                    skip_decision(
                        pair,
                        "already-today",
                        "A signal was already issued for this pair on this Baghdad date. The limit is one new signal per day.",
                        "صدرت إشارة لهذا الزوج في تاريخ بغداد الحالي. الحد هو إشارة جديدة واحدة في اليوم.",
                        snapshot,
                    )
                )
                print(f"PAIR {pair} SKIP already-today; price {price} from {source or 'unpriced'}")
                continue
            try:
                bars = fetch_pair_bars(pair, int(now.timestamp()))
            except FetchError as exc:
                spot = fetch_coinbase_spot(pair)
                if spot is None:
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
                price = round_px(pair, spot)
                shown = fmt_px(pair, price)
                quotes[pair] = "Coinbase"
                decisions.append(
                    skip_decision(
                        pair,
                        "no-data",
                        (
                            f"Price history could not be loaded ({exc}). "
                            f"Coinbase spot {shown} is recorded as the current price only, so no signal is issued."
                        ),
                        (
                            f"تعذر تحميل تاريخ السعر ({exc}). "
                            f"سُجّل سعر كوينبيس الفوري {shown} كسعر حالي فقط، لذلك لا تُصدر إشارة."
                        ),
                        {"price": price, "priceAsOf": iso_z(now), "priceSource": "Coinbase"},
                    )
                )
                print(f"PAIR {pair} SKIP no-data {exc}; Coinbase spot {price}")
                continue
            candle_loads += 1
            quotes[pair] = "Yahoo Finance"
            decision = evaluate_pair(pair, bars["1d"], bars["4h"], bars["1h"], fund, now)
            decision.snapshot["priceSource"] = "Yahoo Finance"
            decision = apply_analyst_gate(decision, analyst, now)
            decisions.append(decision)
            if decision.signal:
                decision.signal["entryReadyTs"] = int(parse_dt(decision.signal["priceAsOf"]).timestamp())
                decision.signal["priceSource"] = "Yahoo Finance"
                open_signals.append(decision.signal)
                print(
                    f"SIGNAL {pair} {decision.signal['direction']} entry {decision.signal['entry']} "
                    f"sl {decision.signal['sl']} tp {decision.signal['tp']} rr {decision.signal['rr']}"
                )
            else:
                print(f"PAIR {pair} SKIP {decision.block}: {decision.summary_en}")
        if candle_loads:
            state["lastIssueDate"] = baghdad_date(now)
            mark_session(now, state, session)
        issuing_pairs = [pair for pair in PAIRS if pair not in NO_ISSUE_PAIRS]
        prices = price_report(issuing_pairs, quotes)
        print(f"PRICES ok={prices['ok']} fallback={','.join(prices['fallback']) or 'none'}")
        print(prices["detail"])
        state["sources"] = {
            "prices": prices,
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
