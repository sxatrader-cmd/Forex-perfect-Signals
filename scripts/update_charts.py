#!/usr/bin/env python3
"""Write one candle file per signal for the live chart on the site.

data/charts/<signal id>.json holds Yahoo Finance candles from before the
signal was issued up to now (open signals) or up to a few hours after the
close (closed signals). Each file includes several timeframes (15m, 1h, 4h,
1d) when Yahoo can serve them; 15m is the default when the trade is recent
enough, otherwise the shortest available interval is used. Open signals are
rewritten each run so the chart grows. A closed signal's file is written once
with "final": true and is never touched again, so the archive keeps the chart
of the trade from issue to TP or SL. Runs after update_signals.py and never
changes signals.json or history.json.
"""

from __future__ import annotations

import sys
import time
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

# key, Yahoo interval, bar seconds, lead before entry, optional max age, optional max span
TF_SPECS: list[tuple[str, str, int, int, int | None, int | None]] = [
    ("15m", "15m", 900, LEAD_SECONDS, MAX_15M_AGE, MAX_15M_SPAN),
    ("1h", "1h", 3600, 7 * 86400, 730 * 86400, 400 * 86400),
    ("4h", "4h", 4 * 3600, 30 * 86400, 730 * 86400, 400 * 86400),
    ("1d", "1d", 86400, 90 * 86400, None, None),
]
TF_SECONDS = {key: seconds for key, _, seconds, *_ in TF_SPECS}
TF_ORDER = [key for key, *_ in TF_SPECS]
RESAMPLE_FROM = {"1h": ["15m"], "4h": ["1h", "15m"], "1d": ["4h", "1h"]}


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


def window_ok(now_ts: int, start: int, end: int, max_age: int | None, max_span: int | None) -> bool:
    if max_age is not None and now_ts - start >= max_age:
        return False
    if max_span is not None and end - start >= max_span:
        return False
    return True


def serialize(bars: list[Bar], digits: int) -> list[list[float]]:
    return [
        [bar.ts, round(bar.open, digits), round(bar.high, digits), round(bar.low, digits), round(bar.close, digits)]
        for bar in bars
    ]


def collect_timeframes(signal: dict, now: datetime) -> dict[str, list[Bar]]:
    """Fetch each timeframe, or resample a shorter one if Yahoo skips it."""
    pair = signal["pair"]
    now_ts = int(now.timestamp())
    issued_ts = int(parse_dt(signal["issuedAt"]).timestamp())
    end = now_ts
    if signal.get("closedAt"):
        end = min(now_ts, int(parse_dt(signal["closedAt"]).timestamp()) + TAIL_SECONDS)
    frames: dict[str, list[Bar]] = {}
    raw_by_key: dict[str, list[Bar]] = {}
    for key, yahoo, seconds, lead, max_age, max_span in TF_SPECS:
        start = issued_ts - lead
        if not window_ok(now_ts, start, end, max_age, max_span):
            continue
        try:
            time.sleep(0.12)
            bars = fetch_yahoo(f"{pair}=X", yahoo, period1=start, period2=end + 120, min_bars=3)
        except (FetchError, ValueError, KeyError) as exc:
            print(f"CHART {signal.get('id')} {key} fetch failed: {exc}")
            bars = []
        snapped = bucket(bars, seconds) if bars else []
        raw_by_key[key] = snapped
        candles = [bar for bar in snapped if start <= bar.ts <= end]
        if candles:
            frames[key] = candles
    for key, sources in RESAMPLE_FROM.items():
        if key in frames:
            continue
        seconds = TF_SECONDS[key]
        lead = next(item[3] for item in TF_SPECS if item[0] == key)
        start = issued_ts - lead
        for src in sources:
            if src not in raw_by_key or not raw_by_key[src]:
                continue
            candles = [bar for bar in bucket(raw_by_key[src], seconds) if start <= bar.ts <= end]
            if candles:
                frames[key] = candles
                print(f"CHART {signal.get('id')} {key} resampled from {src}")
                break
    return frames


def build_chart(signal: dict, frames: dict[str, list[Bar]], now: datetime) -> dict:
    pair = signal["pair"]
    digits = price_digits(pair) + 1
    issued_ts = int(parse_dt(signal["issuedAt"]).timestamp())
    ready_ts = int(signal.get("entryReadyTs") or issued_ts)
    closed = signal.get("status") == "closed"
    default = next(key for key in TF_ORDER if key in frames)
    default_secs = TF_SECONDS[default]
    payload = {
        "id": signal["id"],
        "pair": pair,
        "direction": signal["direction"],
        "entry": signal["entry"],
        "sl": signal["sl"],
        "tp": signal["tp"],
        "issuedAt": signal["issuedAt"],
        "entryTs": issued_ts - issued_ts % default_secs,
        "status": "closed" if closed else "open",
        "interval": default,
        "source": "Yahoo Finance",
        "final": closed,
        "candles": serialize(frames[default], digits),
        "timeframes": {key: serialize(frames[key], digits) for key in TF_ORDER if key in frames},
    }
    if closed:
        fine = next(key for key in TF_ORDER if key in frames)
        hit = close_bar_ts(signal, frames[fine], ready_ts)
        payload.update(
            {
                "result": signal.get("result"),
                "closePrice": signal.get("closePrice"),
                "closedAt": signal.get("closedAt"),
                "pips": signal.get("pips"),
                "closeTs": None if hit is None else hit,
            }
        )
    else:
        payload["currentPrice"] = signal.get("currentPrice")
    return payload


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
            frames = collect_timeframes(signal, now)
        except (FetchError, ValueError, KeyError) as exc:
            print(f"CHART {sid} fetch failed: {exc}")
            continue
        if not frames:
            print(f"CHART {sid} no candles in window")
            continue
        try:
            payload = build_chart(signal, frames, now)
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
        counts = " ".join(f"{key}={len(payload['timeframes'][key])}" for key in payload["timeframes"])
        print(f"CHART {sid} {payload['interval']} {counts} final={payload['final']}")
    print(f"charts written: {wrote}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
