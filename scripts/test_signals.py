#!/usr/bin/env python3
"""Offline checks for indicator math, exits, calendar matching, and the six reasons."""

from __future__ import annotations

import math
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (
    Bar,
    news_agree,
    rates_agree,
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
    normalize_ff,
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
    if parse_number("2.81T") != 2.81e12 or parse_number("2910.5B") != 2910.5e9:
        fail("trillion and billion scales")
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


def _tv_row(
    currency: str,
    country: str,
    when: str,
    title: str,
    actual: str,
    forecast: str = "",
    previous: str = "",
    indicator: str = "",
    unit: str = "",
) -> dict:
    return {
        "currency": currency,
        "country": country,
        "dt": datetime.fromisoformat(when.replace("Z", "+00:00")),
        "title": title,
        "indicator": indicator,
        "unit": unit,
        "actual": actual,
        "forecast": forecast,
        "previous": previous,
    }


def _ff_row(
    currency: str,
    when: str,
    title: str,
    forecast: str = "",
    previous: str = "",
    impact: str = "Low",
) -> dict:
    return {
        "country": currency,
        "date": when,
        "title": title,
        "impact": impact,
        "forecast": forecast,
        "previous": previous,
    }


def _by_title(events: list[dict]) -> dict[tuple[str, str], dict]:
    return {(event["title"], event["time"]): event for event in events}


def test_calendar_actuals_match_the_right_release() -> None:
    """Country, period, and indicator have to agree, and one print is used once.

    The fixture is the 13 Nov 2026 mix-up: Italy's EU-only balance (-0.784B) was
    pasted onto both the Italian total and the eurozone balance, while Flash GDP
    was left blank. The other rows are the same week's wrong or missed matches.
    """
    raw = [
        _ff_row("EUR", "2026-11-13T09:00:00Z", "Italian Trade Balance", "2.84B", "1.77B"),
        _ff_row("EUR", "2026-11-13T10:00:00Z", "Flash Employment Change q/q", "0.2%", "0.1%"),
        _ff_row("EUR", "2026-11-13T10:00:00Z", "Flash GDP q/q", "0.4%", "0.4%"),
        _ff_row("EUR", "2026-11-13T10:00:00Z", "Trade Balance", "-4.5B", "-6.8B"),
        _ff_row("EUR", "2026-11-13T10:00:00Z", "ECB President Lagarde Speaks"),
        _ff_row("JPY", "2026-11-11T23:50:00Z", "PPI y/y", "6.5%", "6.8%"),
        _ff_row("JPY", "2026-11-09T23:30:00Z", "Household Spending y/y", "-3.1%", "-3.1%"),
        _ff_row("JPY", "2026-11-09T23:50:00Z", "Current Account", "2.81T", "2.98T"),
        _ff_row("JPY", "2026-11-10T23:50:00Z", "M2 Money Stock y/y", "2.1%", "2.0%"),
        _ff_row("GBP", "2026-11-12T07:00:00Z", "GDP m/m", "0.0%", "0.1%"),
        _ff_row("GBP", "2026-11-12T07:00:00Z", "Prelim GDP q/q", "0.7%", "0.5%"),
        _ff_row("GBP", "2026-11-12T07:00:00Z", "Prelim Business Investment q/q", "0.4%", "1.7%"),
        _ff_row("GBP", "2026-11-12T07:00:00Z", "Index of Services 3m/3m", "0.9%", "0.9%"),
        _ff_row("NZD", "2026-11-11T21:45:00Z", "Visitor Arrivals m/m", "", "2.8%"),
        _ff_row("CNY", "2026-11-10T02:32:00Z", "USD-Denominated Trade Balance", "126.5B", "133.5B"),
        _ff_row("CNY", "2026-11-10T02:33:00Z", "Trade Balance", "855B", "906B"),
        _ff_row("USD", "2026-11-10T13:14:00Z", "ADP Weekly Employment Change", "", "16.8K"),
        _ff_row("USD", "2026-11-10T13:15:00Z", "ADP Weekly Employment Change", "", "19.5K"),
        _ff_row("USD", "2026-11-10T21:30:00Z", "API Weekly Statistical Bulletin"),
        _ff_row("USD", "2026-11-12T17:00:00Z", "Crude Oil Inventories", "-0.6M", "-0.9M"),
        _ff_row("USD", "2026-11-12T13:30:00Z", "Unemployment Claims", "194K", "189K"),
        _ff_row("USD", "2026-11-10T13:30:00Z", "CPI m/m", "0.3%", "0.6%"),
        _ff_row("USD", "2026-11-10T13:30:00Z", "Core CPI m/m", "0.2%", "0.3%"),
        _ff_row("USD", "2026-11-12T18:01:00Z", "30-y Bond Auction", "", "5.62|2.5"),
        _ff_row("USD", "2026-11-13T13:30:00Z", "PPI m/m", "0.4%", "1.3%"),
        _ff_row("EUR", "2026-11-11T07:00:00Z", "German Final CPI m/m", "-0.2%", "-0.2%"),
        _ff_row("EUR", "2026-11-13T07:45:00Z", "French Final CPI m/m", "0.4%", "0.4%"),
        _ff_row("EUR", "2026-11-13T07:00:00Z", "German WPI m/m", "0.4%", "1.9%"),
        _ff_row("CHF", "2026-11-13T07:30:00Z", "PPI m/m", "0.2%", "0.3%"),
    ]
    tv = [
        _tv_row("EUR", "IT", "2026-11-13T09:00:00Z", "Balance of Trade EU", "-0.784B", previous="-0.276B", indicator="Trade Balance EU"),
        _tv_row("EUR", "IT", "2026-11-13T09:00:00Z", "Balance of Trade", "2.083B", previous="1.824B", indicator="Global Trade Balance"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "Employed Persons Flash", "176547.1K", previous="176577.2K", indicator="Employment Overall Flash"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "Employment Change QoQ Prel", "0%", "0.1%", "0.1%", "Employment Flash QQ"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "Employment Change YoY Prel", "0.4%", "0.4%", "0.5%", "Employment Flash YY"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "GDP Growth Rate QoQ 2nd Est", "0.4%", "0.4%", "0.4%", "GDP Flash Estimate QQ"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "GDP Growth Rate YoY 2nd Est", "1.3%", "1.3%", "1%", "GDP Flash Estimate YY"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "Balance of Trade", "-10.3B", previous="-16.6B", indicator="Eurostat Trade NSA"),
        _tv_row("EUR", "EU", "2026-11-13T10:00:00Z", "Balance of Trade s.a", "-8.7B", previous="-7.8B", indicator="Total Trade Balance SA"),
        _tv_row("JPY", "JP", "2026-11-11T23:50:00Z", "PPI MoM", "0.7%", "0.3%", "-0.2%", "Corp Goods Price MM"),
        _tv_row("JPY", "JP", "2026-11-11T23:50:00Z", "PPI YoY", "7.1%", "6.5%", "6.8%", "Corp Goods Price YY"),
        _tv_row("JPY", "JP", "2026-11-09T23:30:00Z", "Household Spending MoM", "-2.8%", "0.3%", "0.1%"),
        _tv_row("JPY", "JP", "2026-11-09T23:30:00Z", "Household Spending YoY", "-6.8%", "-3.1%", "-3.1%"),
        _tv_row("JPY", "JP", "2026-11-09T23:50:00Z", "Current Account s.a", "1817.7B", previous="2910.5B", indicator="Current Account Bal SA"),
        _tv_row("JPY", "JP", "2026-11-09T23:50:00Z", "Current Account", "2372.3B", "3354.4B", "3993.1B", "Current Account NSA JPY"),
        _tv_row("JPY", "JP", "2026-11-09T23:50:00Z", "Current Account Goods", "-187.53B", previous="-687.72B"),
        _tv_row("JPY", "JP", "2026-11-10T23:50:00Z", "Money Supply M2", "1296T", previous="1296.5T"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "GDP MoM", "0.2%", "0%", "0%", "GDP Estimate MM"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "GDP Growth Rate QoQ Prel", "0.7%", "0.7%", "0.4%", "GDP Prelim QQ"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "GDP 3-Month Avg", "9.9%", "0.7%", "0.6%", "GDP Est 3M/3M"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "Business Investment QoQ Prel", "0.4%", "0.8%", "1.7%"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "Business Investment YoY Prel", "3%", previous="0.8%"),
        _tv_row("GBP", "GB", "2026-11-12T07:00:00Z", "Services Output MoM", "0.2%", "0%", "-0.1%"),
        _tv_row("NZD", "NZ", "2026-11-11T21:45:00Z", "Visitor Arrivals YoY", "9.8%", previous="8%"),
        _tv_row("CNY", "CN", "2026-11-10T03:00:00Z", "Balance of Trade", "105.28B", "125.8B", "133.53B", "Trade Balance USD", "$"),
        _tv_row("CNY", "CN", "2026-11-10T03:00:00Z", "Balance of Trade Yuan", "712.8B", previous="906B", indicator="Yuan-Denominated Trade Balance", unit="CNY"),
        _tv_row("USD", "US", "2026-11-10T13:15:00Z", "ADP Employment Change Weekly", "19750", previous="19500", indicator="ADP Weekly NER Pulse"),
        _tv_row("USD", "US", "2026-11-10T21:30:00Z", "API Heating Oil", "0.433M", indicator="API weekly heating oil"),
        _tv_row("USD", "US", "2026-11-10T21:30:00Z", "API Crude Oil Stock Change", "8.968M", indicator="API wkly crude Stk"),
        _tv_row("USD", "US", "2026-11-12T17:00:00Z", "EIA Crude Oil Imports Change", "0.544M", previous="1.179M"),
        _tv_row("USD", "US", "2026-11-12T17:00:00Z", "EIA Crude Oil Stocks Change", "4.657M", "-1.483M", "-0.865M", "EIA Wkly Crude Stk"),
        _tv_row("USD", "US", "2026-11-12T13:30:00Z", "Initial Jobless Claims", "200K", "195K", "191K", "Initial Jobless Clm"),
        _tv_row("USD", "US", "2026-11-12T13:30:00Z", "Continuing Jobless Claims", "1697K", "1710K", "1717K"),
        _tv_row("USD", "US", "2026-11-12T13:30:00Z", "Jobless Claims 4-week Average", "195.25K", previous="195.25K"),
        _tv_row("USD", "US", "2026-11-10T13:30:00Z", "Inflation Rate MoM", "0.4%", "0.3%", "0.6%", "CPI MM, SA"),
        _tv_row("USD", "US", "2026-11-10T13:30:00Z", "Inflation Rate MoM NSA", "0.17%", previous="0.59%", indicator="CPI MM NSA"),
        _tv_row("USD", "US", "2026-11-10T13:30:00Z", "Core Inflation Rate MoM", "0.3%", "0.2%", "0.3%", "Core CPI MM"),
        _tv_row("USD", "US", "2026-11-12T18:00:00Z", "30-Year Bond Auction Allotted at High", "21.29%", previous="26.77%", indicator="30Y Bond Auc - HAP"),
        _tv_row("USD", "US", "2026-11-12T18:00:00Z", "30-Year Bond Auction Bid-to-Cover", "2.36", previous="2.54", indicator="30Y Bond Auc - BTC"),
        _tv_row("USD", "US", "2026-11-12T18:00:00Z", "30-Year Bond Auction", "5.441%", previous="5.618%", indicator="30Y Bond Auc - HY"),
        _tv_row("USD", "US", "2026-11-12T18:00:00Z", "30-Year Bond Auction Total Accepted", "25B", previous="22B", indicator="30Y Bond Auc - TA"),
        _tv_row("USD", "US", "2026-11-13T13:30:00Z", "PPI MoM", "0.5%", "0.4%", "1.3%"),
        _tv_row("USD", "US", "2026-11-13T13:30:00Z", "PPI Ex Food Energy and Trade Services MoM", "0.9%", "0.4%", "0.5%"),
        _tv_row("EUR", "DE", "2026-11-11T07:00:00Z", "Inflation Rate MoM Final", "-0.2%", "-0.2%", "0.6%", "CPI Final MM"),
        _tv_row("EUR", "DE", "2026-11-11T07:00:00Z", "Harmonised Inflation Rate MoM Final", "-0.1%", "-0.1%", "0.6%", "HICP Final MM"),
        _tv_row("EUR", "FR", "2026-11-13T07:45:00Z", "Inflation Rate MoM Final", "0.4%", "0.4%", "-0.3%", "CPI MM NSA"),
        _tv_row("EUR", "FR", "2026-11-13T07:45:00Z", "Harmonised Inflation Rate MoM Final", "0.5%", "0.4%", "-0.3%", "CPI (EU Norm) Final MM"),
        _tv_row("EUR", "FR", "2026-11-13T07:45:00Z", "Consumer Price Index Final", "103.46", previous="103.07", indicator="CPI NSA"),
        _tv_row("EUR", "DE", "2026-11-13T07:00:00Z", "Wholesale Prices MoM", "0.4%", previous="1.9%", indicator="Wholesale Price Index MM"),
        _tv_row("EUR", "DE", "2026-11-13T07:00:00Z", "Wholesale Prices YoY", "8.8%", previous="8.7%", indicator="Wholesale Price Index YY"),
        _tv_row("CHF", "CH", "2026-11-13T07:30:00Z", "Producer & Import Prices MoM", "0.9%", previous="0.3%", indicator="Producer/Import Price MM"),
        _tv_row("CHF", "CH", "2026-11-13T07:30:00Z", "Producer & Import Prices YoY", "0.9%", previous="-0.2%", indicator="Producer/Import Price YY"),
    ]
    events, matched = normalize_ff(raw, tv)
    got = _by_title(events)

    def actual(title: str, when: str) -> str:
        row = got.get((title, when))
        if row is None:
            fail(f"missing event {title} {when}")
        return row["actual"]

    expect = {
        ("Italian Trade Balance", "2026-11-13T09:00:00Z"): "2.083B",
        ("Flash Employment Change q/q", "2026-11-13T10:00:00Z"): "0%",
        ("Flash GDP q/q", "2026-11-13T10:00:00Z"): "0.4%",
        ("Trade Balance", "2026-11-13T10:00:00Z"): "-8.7B",
        ("ECB President Lagarde Speaks", "2026-11-13T10:00:00Z"): "",
        ("PPI y/y", "2026-11-11T23:50:00Z"): "7.1%",
        ("Household Spending y/y", "2026-11-09T23:30:00Z"): "-6.8%",
        ("Current Account", "2026-11-09T23:50:00Z"): "1817.7B",
        ("M2 Money Stock y/y", "2026-11-10T23:50:00Z"): "",
        ("GDP m/m", "2026-11-12T07:00:00Z"): "0.2%",
        ("Prelim GDP q/q", "2026-11-12T07:00:00Z"): "0.7%",
        ("Prelim Business Investment q/q", "2026-11-12T07:00:00Z"): "0.4%",
        ("Index of Services 3m/3m", "2026-11-12T07:00:00Z"): "",
        ("Visitor Arrivals m/m", "2026-11-11T21:45:00Z"): "",
        ("USD-Denominated Trade Balance", "2026-11-10T02:32:00Z"): "105.28B",
        ("Trade Balance", "2026-11-10T02:33:00Z"): "712.8B",
        ("ADP Weekly Employment Change", "2026-11-10T13:14:00Z"): "",
        ("ADP Weekly Employment Change", "2026-11-10T13:15:00Z"): "19750",
        ("API Weekly Statistical Bulletin", "2026-11-10T21:30:00Z"): "",
        ("Crude Oil Inventories", "2026-11-12T17:00:00Z"): "4.657M",
        ("Unemployment Claims", "2026-11-12T13:30:00Z"): "200K",
        ("CPI m/m", "2026-11-10T13:30:00Z"): "0.4%",
        ("Core CPI m/m", "2026-11-10T13:30:00Z"): "0.3%",
        ("30-y Bond Auction", "2026-11-12T18:01:00Z"): "5.441%",
        ("PPI m/m", "2026-11-13T13:30:00Z"): "0.5%",
        ("German Final CPI m/m", "2026-11-11T07:00:00Z"): "-0.2%",
        ("French Final CPI m/m", "2026-11-13T07:45:00Z"): "0.4%",
        ("German WPI m/m", "2026-11-13T07:00:00Z"): "0.4%",
        ("PPI m/m", "2026-11-13T07:30:00Z"): "0.9%",
    }
    for key, wanted in expect.items():
        if actual(*key) != wanted:
            fail(f"{key[0]} {key[1]} actual {actual(*key)!r}, expected {wanted!r}")
    if matched != sum(1 for value in expect.values() if value):
        fail(f"matched {matched} events, expected {sum(1 for value in expect.values() if value)}")
    # The same TradingView row cannot fill two Forex Factory events.
    twins = [
        _ff_row("USD", "2026-11-10T13:30:00Z", "CPI m/m", "0.3%", "0.6%"),
        _ff_row("USD", "2026-11-10T13:30:00Z", "CPI m/m", "0.3%", "0.6%"),
    ]
    twin_events, twin_matched = normalize_ff(twins, tv)
    filled = [event for event in twin_events if event["actual"]]
    if twin_matched != 1 or len(filled) != 1 or filled[0]["actual"] != "0.4%":
        fail(f"one CPI print must be used once, got {twin_matched} {[(e['actual']) for e in twin_events]}")


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
    fund.rates = {"EUR": 4.50, "USD": 3.50}
    fund.rate_changes = {"EUR": 25.0, "USD": 0.0}
    fund.surprises = {"EUR": 0.40, "USD": -0.20}
    fund.surprise_counts = {"EUR": 2, "USD": 1}
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
            "rateBase": 4.50,
            "rateQuote": 3.50,
            "rateChangeBase": 25.0,
            "rateChangeQuote": -25.0,
        },
        fund,
    )
    if len(reasons) != 6:
        fail(str(len(reasons)))
    blob = reasons[5]["en"] + reasons[5]["ar"]
    for needle in ("165K", "65K", "ForexLive", "+0.25", "Euro rebounds as ECB stays hawkish", "+0.40"):
        if needle not in blob:
            fail(f"missing {needle} in the news reason")
    rate_blob = reasons[4]["en"] + reasons[4]["ar"]
    for needle in ("4.50", "3.50", "+25", "-25"):
        if needle not in rate_blob:
            fail(f"missing {needle} in the rate reason")


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


def test_rate_and_news_gates() -> None:
    now = datetime(2026, 11, 4, 8, tzinfo=timezone.utc)
    fund = empty_fundamentals(now)
    fund.rates = {"EUR": 4.50, "USD": 3.50}
    fund.rate_changes = {"EUR": 0.0, "USD": 0.0}
    fund.surprises = {"EUR": 0.30, "USD": -0.10}
    if not rates_agree(fund, "EURUSD", "BUY"):
        fail("higher EUR rate should allow a buy when the 120-day change does not fight it")
    if rates_agree(fund, "EURUSD", "SELL"):
        fail("a sell fights the rate gap")
    fund.rate_changes = {"EUR": -50.0, "USD": 0.0}
    if rates_agree(fund, "EURUSD", "BUY"):
        fail("a cut in the base currency conflicts with a higher rate level")
    if not news_agree(fund, "EURUSD", "BUY"):
        fail("positive EUR surprise versus USD should favour a buy")
    fund.surprises = {"EUR": 0.0, "USD": 0.0}
    if news_agree(fund, "EURUSD", "BUY"):
        fail("a flat surprise does not favour a direction")


def test_pause_blocks_issue_even_when_forced() -> None:
    from update_signals import should_issue

    now = datetime(2026, 11, 10, 8, tzinfo=timezone.utc)
    os.environ["PAUSE_ISSUE"] = "1"
    os.environ["FORCE_ISSUE"] = "1"
    try:
        if should_issue(now, {"lastIssueDate": "2026-11-09"}):
            fail("PAUSE_ISSUE must block a new signal even when FORCE_ISSUE is set")
    finally:
        os.environ.pop("PAUSE_ISSUE", None)
        os.environ.pop("FORCE_ISSUE", None)
    if not should_issue(now, {"lastIssueDate": "2026-11-09"}):
        fail("issue should proceed when the pause is off and the daily pass is due")


def test_session_scans() -> None:
    from update_signals import due_session, mark_session

    def at(*args):
        return datetime(*args, tzinfo=timezone.utc)

    # Winter (CET/GMT/EST): Frankfurt 07:00, London 08:00, New York 13:00 UTC.
    cases = [
        (at(2026, 11, 10, 7, 5), "frankfurt"),
        (at(2026, 11, 10, 6, 55), None),
        (at(2026, 11, 10, 13, 5), "new_york"),
        (at(2026, 11, 10, 10, 30), None),
        # Summer (CEST/BST/EDT): Frankfurt 06:00, London 07:00, New York 12:00 UTC.
        (at(2026, 7, 14, 6, 5), "frankfurt"),
        (at(2026, 7, 14, 12, 5), "new_york"),
        (at(2026, 7, 14, 13, 30), "new_york"),
        (at(2026, 7, 14, 14, 5), None),
        # Saturday: market closed.
        (at(2026, 11, 14, 8, 5), None),
    ]
    for now, expected in cases:
        got = due_session(now, {})
        if got != expected:
            fail(f"due_session({now.isoformat()}) = {got}, expected {expected}")
    now = at(2026, 11, 10, 8, 5)  # Frankfurt (07:00) and London (08:00) both inside their windows
    state: dict = {}
    first = due_session(now, state)
    mark_session(now, state, first)
    second = due_session(now, state)
    mark_session(now, state, second)
    if (first, second) != ("frankfurt", "london") or due_session(now, state) is not None:
        fail(f"overlapping Frankfurt/London scans should run once each, got {first}, {second}, {state}")


def test_chart_payload() -> None:
    from update_charts import build_chart, bucket

    base = 1_794_340_800
    raw = [Bar(base + i * 900, 1.1, 1.1 + i * 0.0001, 1.1 - 0.0001, 1.1) for i in range(12)]
    raw.append(Bar(base + 11 * 900 + 37, 1.1, 1.2, 1.0, 1.15))
    merged = bucket(raw, 900)
    if len(merged) != 12 or merged[-1].close != 1.15 or merged[-1].high != 1.2:
        fail("chart bucketing should merge the live partial bar into its 15m candle")
    signal = {
        "id": "EURUSD-T", "pair": "EURUSD", "direction": "SELL", "entry": 1.1, "sl": 1.101, "tp": 1.0995,
        "issuedAt": iso_z(datetime.fromtimestamp(base + 1800, timezone.utc)), "status": "open", "currentPrice": 1.1,
    }
    now = datetime.fromtimestamp(base + 12 * 900, timezone.utc)
    live = build_chart(signal, {"15m": merged, "1h": bucket(merged, 3600)}, now)
    if live["final"] or live["status"] != "open" or live["entryTs"] != base + 1800 or not live["candles"]:
        fail("open chart should be live with an aligned entry time")
    if live["interval"] != "15m" or "15m" not in live["timeframes"] or "1h" not in live["timeframes"]:
        fail("open chart should keep 15m as the default and also store other timeframes")
    closed = dict(signal, status="closed", result="TP", closePrice=1.0995, pips=5.0,
                  closedAt=iso_z(datetime.fromtimestamp(base + 8 * 900, timezone.utc)))
    hit = [*merged[:4], Bar(base + 4 * 900, 1.1, 1.1, 1.0994, 1.0996), *merged[5:]]
    final = build_chart(closed, {"15m": hit}, now)
    if not final["final"] or final["result"] != "TP" or final["closeTs"] != base + 4 * 900:
        fail("closed chart should be final and mark the candle that touched the target")


def test_coinbase_spot_and_price_health() -> None:
    from fps_lib import NO_ISSUE_PAIRS, PAIRS, parse_coinbase_spot
    from update_signals import apply_spot_mark, price_report

    spot = parse_coinbase_spot(
        "EURUSD",
        {"data": {"amount": "1.1053", "base": "EUR", "currency": "USD"}},
    )
    if spot != 1.1053:
        fail(f"coinbase spot {spot}")
    if parse_coinbase_spot("EURUSD", {"data": {"amount": "1.1", "base": "EUR", "currency": "GBP"}}) is not None:
        fail("mismatched coinbase currency must be rejected")
    if parse_coinbase_spot("EURUSD", {"data": {"amount": "0", "base": "EUR", "currency": "USD"}}) is not None:
        fail("non-positive spot")
    if parse_coinbase_spot("NOSUCH", {"data": {"amount": "1", "base": "NO", "currency": "SUCH"}}) is not None:
        fail("unknown pair")

    issuing = [pair for pair in PAIRS if pair not in NO_ISSUE_PAIRS]
    yahoo = {pair: "Yahoo Finance" for pair in issuing}
    healthy = price_report(issuing, yahoo)
    if not healthy["ok"] or healthy["fallback"] or "12 of 12" not in healthy["detail"]:
        fail(f"a quote for every issuing pair, including one that is already open, must be ok: {healthy}")
    mixed = dict(yahoo)
    mixed["GBPNZD"] = "Coinbase"
    fallback = price_report(issuing, mixed)
    if (
        not fallback["ok"]
        or fallback["fallback"] != ["GBPNZD"]
        or "Coinbase spot fallback for GBPNZD" not in fallback["detail"]
    ):
        fail(f"fallback should stay ok and be named: {fallback}")
    missing = dict(yahoo)
    del missing["EURCAD"]
    broken = price_report(issuing, missing)
    if broken["ok"] or "11 of 12" not in broken["detail"] or "No price for EURCAD" not in broken["detail"]:
        fail(f"missing price must fail health: {broken}")

    issued = datetime(2026, 11, 13, 8, tzinfo=timezone.utc)
    signal = {
        "pair": "GBPNZD",
        "direction": "BUY",
        "entry": 2.38000,
        "sl": 2.37000,
        "tp": 2.40000,
        "issuedAt": iso_z(issued),
        "status": "open",
        "updates": [],
        "indicators": {"ema50": 2.37000},
    }
    marked = apply_spot_mark(signal, 2.39017, iso_z(issued + timedelta(minutes=30)), issued + timedelta(minutes=30))
    if marked.get("status") != "open" or marked.get("result") or marked.get("priceSource") != "Coinbase":
        fail(f"spot mark must not close the trade: {marked}")
    if marked["currentPrice"] != 2.39017 or marked.get("updates"):
        fail("spot mark should store the price and wait four hours for a note")
    later = apply_spot_mark(signal, 2.39017, iso_z(issued + timedelta(hours=4)), issued + timedelta(hours=4))
    if not later.get("updates") or later["updates"][-1].get("price") != 2.39017:
        fail("a due spot mark can note the price without a candle RSI")
    if "RSI" in later["updates"][-1]["comment"]["en"]:
        fail("spot note must not invent an RSI reading")


def test_track_falls_back_to_coinbase_spot() -> None:
    import update_signals
    from fps_lib import Bar, FetchError

    now = datetime(2026, 11, 13, 12, tzinfo=timezone.utc)
    signal = {
        "id": "EURUSD-20261113-BUY",
        "pair": "EURUSD",
        "direction": "BUY",
        "entry": 1.10000,
        "sl": 1.09000,
        "tp": 1.12000,
        "issuedAt": iso_z(now),
        "status": "open",
        "currentPrice": 1.10000,
        "floatingPips": 0.0,
        "updates": [],
        "indicators": {"ema50": 1.09000},
    }

    def yahoo_down(*_args, **_kwargs):
        raise FetchError("yahoo down")

    def spot(pair: str) -> float:
        if pair != "EURUSD":
            fail(f"unexpected spot pair {pair}")
        return 1.1053

    original_yahoo = update_signals.fetch_yahoo
    original_spot = update_signals.fetch_coinbase_spot
    update_signals.fetch_yahoo = yahoo_down
    update_signals.fetch_coinbase_spot = spot
    try:
        still, closed, changed, quoted = update_signals.track([dict(signal)], now)
    finally:
        update_signals.fetch_yahoo = original_yahoo
        update_signals.fetch_coinbase_spot = original_spot
    if closed or not changed or quoted != {"EURUSD": "Coinbase"}:
        fail(f"yahoo failure should price from Coinbase without closing: {closed} {quoted}")
    marked = still[0]
    if marked["status"] != "open" or marked.get("result") or marked["priceSource"] != "Coinbase":
        fail(f"spot fallback must leave the signal open: {marked}")
    if marked["currentPrice"] != 1.1053:
        fail(f"spot price not stored: {marked['currentPrice']}")

    def yahoo_bars(*_args, **_kwargs):
        start = int(now.timestamp()) - 20 * 3600
        return [Bar(start + index * 3600, 1.1, 1.101, 1.099, 1.1) for index in range(15)]

    called = {"spot": 0}

    def spot_unused(_pair: str) -> float:
        called["spot"] += 1
        return 9.0

    update_signals.fetch_yahoo = yahoo_bars
    update_signals.fetch_coinbase_spot = spot_unused
    try:
        _still, closed, _changed, quoted = update_signals.track([dict(signal)], now)
    finally:
        update_signals.fetch_yahoo = original_yahoo
        update_signals.fetch_coinbase_spot = original_spot
    if closed or quoted != {"EURUSD": "Yahoo Finance"} or called["spot"]:
        fail(f"yahoo candles must stay the price and skip Coinbase: {quoted} {called} {closed}")


if __name__ == "__main__":
    test_ema_rsi_macd()
    test_exit_rules()
    test_surprise_and_match()
    test_calendar_actuals_match_the_right_release()
    test_issuance_limits()
    test_clear_setup_has_six_reasons()
    test_reason_copy_contains_fundamentals()
    test_four_hour_updates_and_immutable_archive()
    test_rate_and_news_gates()
    test_pause_blocks_issue_even_when_forced()
    test_session_scans()
    test_chart_payload()
    test_coinbase_spot_and_price_health()
    test_track_falls_back_to_coinbase_spot()
    print("all signal tests passed")
