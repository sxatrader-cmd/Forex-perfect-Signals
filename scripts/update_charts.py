#!/usr/bin/env python3
"""Write one candle file per signal for the live chart on the site.

data/charts/<signal id>.json holds 15-minute Yahoo Finance candles from a day
and a half before the signal was issued up to now (open signals) or up to a
few hours after the close (closed signals). Open signals are rewritten each
run so the chart grows. A closed signal's file is written once with
"final": true and is never touched again, so the archive keeps the chart of
the trade from issue to TP or SL. Runs after update_signals.py and never
changes signals.json or history.json.
"""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import DATA, Bar, FetchError, fetch_yahoo, iso_z, load_json, parse_dt, price_digits, utc_now, write_json

CHARTS = DATA / "charts"
LEAD_SECONDS = 36 * 3600
TAIL_SECONDS = 3 * 3600
# Yahoo serves 15m candles for about 60 days back; older or very long trades use 1h.
MAX_15M_AGE = 55 * 86400
MAX_15M_SPAN = 21 * 86400


def bucket(bars: list[Bar], seconds: int) -> list[Bar]:
    """Snap bars onto the interval grid and merge the live partial bar Yahoo appends."""
    out: dict[int, Bar] = {}
    for bar in sorted(bars, key=lambda item: item.ts):
        ts = bar.ts - bar.ts % seconds
        prev = out.get(ts)
        if prev is None:
            out[ts] = Bar(ts, bar.open, bar.high, bar.low, bar.close)
        else:
            out[ts] = Bar(ts, prev.open, max(prev.high, bar.high), min(prev.low, bar.low), bar.close)
    return [out[key] for key in sorted(out)]


def close_bar_ts(signal: dict, bars: list[Bar], start_ts: int) -> int | None:
    """First candle after the entry whose range touched the close level."""
    level = signal.get("closePrice")
    if level is None:
        return None
    closed_ts = int(parse_dt(signal["closedAt"]).timestamp()) if signal.get("closedAt") else None
    for bar in bars:
        if bar.ts < start_ts:
            continue
        if closed_ts is not None and bar.ts >= closed_ts:
            break
        if bar.low <= level <= bar.high:
            return bar.ts
    return None if closed_ts is None else max(start_ts, closed_ts - 60)


def build_chart(signal: dict, bars: list[Bar], interval: int, now: datetime) -> dict:
    pair = signal["pair"]
    digits = price_digits(pair) + 1
    issued_ts = int(parse_dt(signal["issuedAt"]).timestamp())
    ready_ts = int(signal.get("entryReadyTs") or issued_ts)
    entry_ts = min(issued_ts, ready_ts)
    start = entry_ts - LEAD_SECONDS
    closed = signal.get("status") == "closed"
    end = int(now.timestamp())
    if closed and signal.get("closedAt"):
        end = min(end, int(parse_dt(signal["closedAt"]).timestamp()) + TAIL_SECONDS)
    candles = [bar for bar in bucket(bars, interval) if start <= bar.ts <= end]
    payload = {
        "id": signal["id"],
        "pair": pair,
        "direction": signal["direction"],
        "entry": signal["entry"],
        "sl": signal["sl"],
        "tp": signal["tp"],
        "issuedAt": signal["issuedAt"],
        "entryTs": issued_ts - issued_ts % interval,
        "status": "closed" if closed else "open",
        "interval": "15m" if interval == 900 else "1h",
        "source": "Yahoo Finance",
        "final": closed,
        "candles": [
            [bar.ts, round(bar.open, digits), round(bar.high, digits), round(bar.low, digits), round(bar.close, digits)]
            for bar in candles
        ],
    }
    if closed:
        hit = close_bar_ts(signal, candles, ready_ts)
        payload.update(
            {
                "result": signal.get("result"),
                "closePrice": signal.get("closePrice"),
                "closedAt": signal.get("closedAt"),
                "pips": signal.get("pips"),
                "closeTs": None if hit is None else hit - hit % interval,
            }
        )
    else:
        payload["currentPrice"] = signal.get("currentPrice")
    return payload


def fetch_chart_bars(signal: dict, now: datetime) -> tuple[list[Bar], int]:
    pair = signal["pair"]
    now_ts = int(now.timestamp())
    issued_ts = int(parse_dt(signal["issuedAt"]).timestamp())
    start = issued_ts - LEAD_SECONDS
    end = now_ts
    if signal.get("closedAt"):
        end = min(now_ts, int(parse_dt(signal["closedAt"]).timestamp()) + TAIL_SECONDS)
    interval = 900 if now_ts - start < MAX_15M_AGE and end - start < MAX_15M_SPAN else 3600
    bars = fetch_yahoo(f"{pair}=X", "15m" if interval == 900 else "1h", period1=start, period2=end + 120)
    return bars, interval


def same_candles(path: Path, payload: dict) -> bool:
    previous = load_json(path)
    if not previous:
        return False
    keep = {key: value for key, value in previous.items() if key != "updatedAt"}
    return keep == payload


def main() -> int:
    now = utc_now()
    signals = (load_json(DATA / "signals.json") or {}).get("open") or []
    history = (load_json(DATA / "history.json") or {}).get("closed") or []
    wrote = 0
    for signal in [*signals, *history]:
        sid = signal.get("id")
        if not sid or sid == "empty":
            continue
        path = CHARTS / f"{sid}.json"
        existing = load_json(path)
        if existing and existing.get("final"):
            continue
        try:
            bars, interval = fetch_chart_bars(signal, now)
        except (FetchError, ValueError, KeyError) as exc:
            print(f"CHART {sid} fetch failed: {exc}")
            continue
        try:
            payload = build_chart(signal, bars, interval, now)
        except (ValueError, KeyError, TypeError) as exc:
            print(f"CHART {sid} build failed: {exc}")
            continue
        if not payload["candles"]:
            print(f"CHART {sid} no candles in window")
            continue
        if same_candles(path, payload):
            print(f"CHART {sid} unchanged")
            continue
        payload["updatedAt"] = iso_z(now)
        write_json(path, payload)
        wrote += 1
        print(f"CHART {sid} {payload['interval']} {len(payload['candles'])} candles final={payload['final']}")
    print(f"charts written: {wrote}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
