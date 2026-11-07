#!/usr/bin/env python3
"""Offline checks for indicator math, exits, calendar matching, and the six reasons."""

from __future__ import annotations

import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (
    Bar,
    actual_is_compatible,
    atr,
    build_progress_update,
    build_reasons,
    due_for_update,
    ema,
    empty_fundamentals,
    evaluate_pair,
    floating_pips,
    iso_z,
    issuance_block,
    jaccard,
    macd,
    match_actual,
    merge_closed,
    parse_number,
    resolve_exit,
    rsi,
    surprise_fraction,
    title_tokens,
)


def fail(message: str) -> None:
    raise SystemExit(message)


def test_ema_rsi_macd() -> None:
    values = [1, 2, 3, 4, 5]
    averages = ema(values, 3)
    if averages[2] != 2 or averages[3] != 3 or averages[4] != 4:
        fail(f"ema mismatch {averages}")
    series = [float(i) for i in range(1, 40)]
    readings = rsi(series)
    if readings[-1] is None or readings[-1] < 90:
        fail(f"rsi on a rising series should be high, got {readings[-1]}")
    line, signal, hist = macd(series)
    if line[-1] is None or signal[-1] is None or hist[-1] is None:
        fail("macd did not warm up on a 39-point series")
    bars = []
    price = 1.0
    for index in range(30):
        price += 0.01
        bars.append(Bar(index * 3600, price - 0.01, price + 0.02, price - 0.02, price))
    if atr(bars)[-1] is None or atr(bars)[-1] <= 0:
        fail("atr missing")


def test_exit_rules() -> None:
    bars = [
        Bar(1_000, 1.0, 1.01, 0.99, 1.0),
        Bar(2_000, 1.10, 1.20, 0.90, 1.0),
    ]
    both = resolve_exit("BUY", 2_000, 0.95, 1.15, bars)
    if not both or both[0] != "SL":
        fail(f"same-bar collision must prefer the stop, got {both}")
    target = resolve_exit("BUY", 2_000, 0.80, 1.15, [Bar(2_000, 1.0, 1.16, 0.99, 1.1)])
    if not target or target[0] != "TP" or target[1] != 1.15:
        fail(f"target miss {target}")
    ignored = resolve_exit("SELL", 5_000, 1.20, 0.90, [Bar(1_000, 1.0, 1.30, 0.80, 1.0)])
    if ignored is not None:
        fail("bars before the entry must not close the trade")
    if floating_pips("USDJPY", "BUY", 150.00, 150.25) != 25.0:
        fail("jpy pip math")
    if floating_pips("EURUSD", "SELL", 1.1000, 1.0980) != 20.0:
        fail("eur pip math")


def test_surprise_and_match() -> None:
    if parse_number("165K") != 165_000:
        fail("165K")
    if parse_number("4.2%") != 4.2:
        fail("percent")
    nfp = surprise_fraction("Non-Farm Employment Change", "165K", "65K")
    if nfp is None or nfp <= 0:
        fail(f"nfp surprise should be positive, got {nfp}")
    unemployment = surprise_fraction("Unemployment Rate", "4.1%", "4.2%")
    if unemployment is None or unemployment <= 0:
        fail("lower unemployment should be a positive surprise")
    event = {
        "title": "Non-Farm Employment Change",
        "currency": "USD",
        "time": "2026-11-06T13:30:00Z",
    }
    tv = [
        {
            "currency": "USD",
            "dt": datetime(2026, 11, 6, 13, 30, tzinfo=timezone.utc),
            "tokens": title_tokens("Non Farm Payrolls Non-Farm Payrolls"),
            "title": "Non Farm Payrolls",
            "actual": "165K",
        },
        {
            "currency": "CAD",
            "dt": datetime(2026, 11, 6, 13, 30, tzinfo=timezone.utc),
            "tokens": title_tokens("Employment Change"),
            "title": "Employment Change",
            "actual": "-4.7K",
        },
    ]
    found = match_actual(event, tv)
    if not found or found["actual"] != "165K":
        fail(f"expected NFP actual match, got {found}")
    if jaccard(title_tokens("CPI y/y"), title_tokens("CPI YoY")) <= 0:
        fail("cpi tokens should overlap")
    votes = {"title": "MPC Official Bank Rate Votes", "forecast": "7-0-2", "previous": "3-0-6"}
    if actual_is_compatible(votes, "4%"):
        fail("vote counts must not inherit the bank-rate print")
    cpi = {"title": "CPI m/m", "forecast": "0.0%", "previous": "0.1%"}
    if actual_is_compatible(cpi, "102"):
        fail("an index level must not fill a percent forecast")
    if not actual_is_compatible({"title": "Non-Farm Employment Change", "forecast": "65K", "previous": "29K"}, "165K"):
        fail("nfp actual should stay compatible")


def test_issuance_limits() -> None:
    now = datetime(2026, 11, 7, 6, tzinfo=timezone.utc)
    open_signals = [{"pair": "EURUSD", "status": "open", "issuedAt": "2026-11-06T05:00:00Z"}]
    history = [{"pair": "GBPUSD", "issuedAt": "2026-11-07T05:10:00Z", "status": "closed"}]
    if issuance_block("EURUSD", open_signals, history, now) != "open":
        fail("open signal must block")
    if issuance_block("GBPUSD", [], history, now) != "already-today":
        fail("closed signal from today must block a second one")
    if issuance_block("USDJPY", open_signals, history, now) is not None:
        fail("a free pair should not be blocked")


def clear_buy_bars() -> tuple[list[Bar], list[Bar], list[Bar]]:
    """A bullish daily stack and a 4H pullback that sits inside the RSI/ATR band."""
    closes: list[float] = []
    price = 1.05
    for index in range(275):
        if index < 210:
            price += 0.00040
        else:
            phase = index - 210
            price += math.sin(phase / 2.2) * 0.00025 + 0.00002
        closes.append(price)
    h4: list[Bar] = []
    previous = closes[0]
    start = datetime(2026, 6, 1, tzinfo=timezone.utc)
    for index, close in enumerate(closes):
        span = 0.0018
        h4.append(
            Bar(
                int((start + timedelta(hours=4 * index)).timestamp()),
                previous,
                max(previous, close) + span * 0.6,
                min(previous, close) - span * 0.4,
                close,
            )
        )
        previous = close
    last = closes[-1]
    daily: list[Bar] = []
    start_price = last - 260 * 0.0005
    previous = start_price
    day_zero = datetime(2025, 1, 1, tzinfo=timezone.utc)
    for index in range(260):
        close = start_price + (last - start_price) * (index + 1) / 260
        daily.append(
            Bar(
                int((day_zero + timedelta(days=index)).timestamp()),
                previous,
                max(previous, close) + 0.0008,
                min(previous, close) - 0.0008,
                close,
            )
        )
        previous = close
    h1 = [Bar(h4[-1].ts + 3600, last, last, last, last)]
    return daily, h4, h1


def test_clear_setup_has_six_reasons() -> None:
    now = datetime(2026, 11, 4, 12, tzinfo=timezone.utc)  # Wednesday, market open
    fund = empty_fundamentals(now, sources=["Yahoo Finance", "unit-test"])
    daily, h4, h1 = clear_buy_bars()
    found = evaluate_pair(pair="EURUSD", daily=daily, h4=h4, h1=h1, fund=fund, now=now)
    if not found.signal:
        fail(f"clear series was rejected: {found.block} {found.summary_en}")
    signal = found.signal
    if signal["direction"] not in {"BUY", "SELL"}:
        fail("direction")
    if len(signal["reasons"]) != 6:
        fail("expected 6 reasons")
    risk = abs(signal["entry"] - signal["sl"])
    reward = abs(signal["tp"] - signal["entry"])
    if risk <= 0 or reward < 1.5 * risk - 1e-8:
        fail(f"rr failed {signal['entry']} {signal['sl']} {signal['tp']}")
    for reason in signal["reasons"]:
        if not reason["en"] or not reason["ar"]:
            fail("empty reason")
        if reason["en"] == reason["ar"]:
            fail("arabic reason must differ from english")
    entry = f"{signal['entry']:.5f}"
    if entry not in signal["reasons"][0]["en"] or entry not in signal["reasons"][0]["ar"]:
        fail("entry price missing from the trend reason")
    rsi_text = f"{signal['indicators']['rsi4h']:.1f}"
    if rsi_text not in signal["reasons"][1]["en"]:
        fail("rsi missing from reason 2")
    # A flat market must not be forced through.
    flat = []
    price = 1.1
    for index in range(260):
        flat.append(Bar(1_700_000_000 + index * 86400, price, price + 0.0001, price - 0.0001, price))
    h4_flat = [Bar(1_700_000_000 + index * 14400, price, price + 0.0001, price - 0.0001, price) for index in range(260)]
    h1_flat = [Bar(h4_flat[-1].ts, price, price, price, price)]
    skipped = evaluate_pair("EURUSD", flat, h4_flat, h1_flat, fund, now)
    if skipped.signal:
        fail("flat prices must not produce a signal")


def test_reason_copy_contains_fundamentals() -> None:
    now = datetime(2026, 11, 4, 12, tzinfo=timezone.utc)
    fund = empty_fundamentals(now, sources=["Yahoo Finance", "ForexLive"])
    fund.sentiment = {"EUR": 0.25, "USD": -0.5}
    fund.counts = {"EUR": 4, "USD": 5}
    fund.surprises = {"EUR": 0.4, "USD": 1.0}
    fund.examples = {
        "USD": {
            "currency": "USD",
            "title": "Non-Farm Employment Change",
            "actual": "165K",
            "forecast": "65K",
            "fraction": 1.0,
        }
    }
    fund.headline_examples = {
        "EUR": {"title": "Euro rebounds as ECB stays hawkish", "source": "ForexLive", "tone": 1}
    }
    reasons = build_reasons(
        "EURUSD",
        "BUY",
        1.10500,
        1.10125,
        1.11063,
        {
            "ema20": 1.10000,
            "ema50": 1.09000,
            "ema200": 1.07000,
            "rsi4": 55.0,
            "macd": 0.001000,
            "macdSignal": 0.000400,
            "macdHist": 0.000600,
            "atr4": 0.00250,
            "swing": 1.09900,
        },
        fund,
    )
    if len(reasons) != 6:
        fail(str(len(reasons)))
    blob = reasons[5]["en"] + reasons[5]["ar"]
    for needle in ("165K", "65K", "ForexLive", "+0.25", "Euro rebounds as ECB stays hawkish"):
        if needle not in blob:
            fail(f"missing {needle} in fundamentals reason")


def test_four_hour_updates_and_immutable_archive() -> None:
    issued = datetime(2026, 11, 4, 12, tzinfo=timezone.utc)
    signal = {
        "id": "EURUSD-20261104-BUY",
        "pair": "EURUSD",
        "direction": "BUY",
        "entry": 1.10000,
        "sl": 1.09000,
        "tp": 1.12000,
        "issuedAt": iso_z(issued),
        "updates": [],
        "indicators": {"ema50": 1.08000},
    }
    if due_for_update(signal, issued + timedelta(hours=3, minutes=59)):
        fail("an update must wait four hours")
    later = issued + timedelta(hours=4)
    if not due_for_update(signal, later):
        fail("an update is due at four hours")
    note = build_progress_update(signal, 1.10500, later, 48.2, [])
    if note["price"] != 1.105 or note["floatingPips"] != 50.0:
        fail(f"update math {note}")
    if note["progressToTp"] != 25.0:
        fail(f"progress {note['progressToTp']}")
    if "1.08000" not in note["comment"]["en"] or "1.08000" not in note["comment"]["ar"]:
        fail("comment must cite the saved EMA50")
    if "original plan" not in note["comment"]["en"].lower() and "unchanged" not in note["comment"]["en"].lower():
        fail("comment must keep the original plan")
    if "48.2" not in note["comment"]["en"]:
        fail("rsi missing")
    archived = [{"id": "EURUSD-20261104-BUY", "result": "TP", "pips": 40, "reasons": [{"en": "a", "ar": "ب"}]}]
    merged = merge_closed(
        archived,
        [
            {"id": "EURUSD-20261104-BUY", "result": "SL", "pips": -20},
            {"id": "GBPUSD-20261105-SELL", "result": "SL", "pips": -12},
        ],
    )
    if merged[0]["result"] != "TP" or merged[0]["pips"] != 40 or merged[0]["reasons"][0]["en"] != "a":
        fail("archived result was edited")
    if len(merged) != 2 or merged[1]["id"] != "GBPUSD-20261105-SELL":
        fail("new archive row missing")


if __name__ == "__main__":
    test_ema_rsi_macd()
    test_exit_rules()
    test_surprise_and_match()
    test_issuance_limits()
    test_clear_setup_has_six_reasons()
    test_reason_copy_contains_fundamentals()
    test_four_hour_updates_and_immutable_archive()
    print("all signal tests passed")
