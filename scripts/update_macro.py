#!/usr/bin/env python3
"""Refresh the policy-rate path and the high-impact calendar from TradingView.

The first run (or `python3 scripts/update_macro.py --full`) downloads 1 Aug 2025
through ten days ahead. Later runs only ask for the last 21 days plus the next
10, then merge by event id. Decisions whose title is the policy rate itself
are written to data/policy_rates.json. High-impact releases, including those
decisions, are written to data/macro_calendar.json.

TradingView's public calendar is the same feed the website uses. It can change
without notice. A failed refresh keeps the files already on disk.
"""
from __future__ import annotations

import json
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import DATA, FetchError, TV_URL, http_get, is_policy_decision, parse_dt, write_json  # noqa: E402

ROOT = DATA
CAL_PATH = ROOT / "macro_calendar.json"
RATE_PATH = ROOT / "policy_rates.json"
COUNTRIES = "US,EU,GB,JP,AU,CA,NZ,CH"
FULL_START = date(2025, 8, 1)
HEADERS = {"Origin": "https://www.tradingview.com", "Referer": "https://www.tradingview.com/"}


def fetch_window(start: date, end: date) -> list[dict]:
    url = (
        f"{TV_URL}?from={start.isoformat()}T00:00:00.000Z"
        f"&to={end.isoformat()}T00:00:00.000Z&countries={COUNTRIES}"
    )
    payload = json.loads(http_get(url, headers=HEADERS, timeout=40).decode("utf-8"))
    if payload.get("status") != "ok":
        raise FetchError("TradingView calendar did not return status ok")
    kept = []
    for item in payload.get("result") or []:
        title = str(item.get("title") or "").strip()
        currency = str(item.get("currency") or "").upper()
        moment = item.get("date")
        if not title or not currency or not moment:
            continue
        importance = item.get("importance")
        policy = is_policy_decision(title)
        if not policy and importance != 1:
            continue
        actual = _num(item.get("actual"))
        forecast = _num(item.get("forecast"))
        previous = _num(item.get("previous"))
        kept.append(
            {
                "id": str(item.get("id") or f"{currency}|{title}|{moment}"),
                "currency": currency,
                "time": parse_dt(str(moment)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "impact": "High",
                "title": title,
                "actual": actual,
                "forecast": forecast,
                "previous": previous,
                "policy": policy,
            }
        )
    return kept


def _num(value) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def merge(existing: list[dict], fresh: list[dict]) -> list[dict]:
    by_id = {row["id"]: row for row in existing}
    for row in fresh:
        by_id[row["id"]] = row
    rows = list(by_id.values())
    rows.sort(key=lambda row: (row["time"], row["currency"], row["title"]))
    return rows


def policy_table(events: list[dict]) -> dict:
    banks: dict[str, list[dict]] = {}
    for row in events:
        if not row.get("policy") or row.get("actual") is None:
            continue
        previous = row.get("previous")
        change = None if previous is None else round((float(row["actual"]) - float(previous)) * 100)
        banks.setdefault(row["currency"], []).append(
            {
                "time": row["time"],
                "rate": row["actual"],
                "previous": previous,
                "changeBp": change,
                "title": row["title"],
            }
        )
    for rows in banks.values():
        rows.sort(key=lambda row: row["time"])
        # Drop a second print at the same timestamp (projections are already filtered).
        deduped = []
        seen = set()
        for row in rows:
            if row["time"] in seen:
                continue
            seen.add(row["time"])
            deduped.append(row)
        rows[:] = deduped
    return banks


def main() -> int:
    full = "--full" in sys.argv or not CAL_PATH.exists()
    today = datetime.now(timezone.utc).date()
    end = today + timedelta(days=10)
    start = FULL_START if full else today - timedelta(days=21)
    existing = []
    if CAL_PATH.exists() and not full:
        payload = json.loads(CAL_PATH.read_text(encoding="utf-8"))
        existing = payload.get("events") or []
    fresh: list[dict] = []
    cursor = start
    while cursor < end:
        chunk_end = min(cursor + timedelta(days=31), end)
        try:
            batch = fetch_window(cursor, chunk_end)
        except FetchError as exc:
            print(f"macro refresh failed: {exc}")
            return 0 if existing else 1
        fresh.extend(batch)
        print(f"macro {cursor.isoformat()}..{chunk_end.isoformat()} {len(batch)} rows", flush=True)
        cursor = chunk_end
        time.sleep(0.2)
    events = fresh if full else merge(existing, fresh)
    banks = policy_table(events)
    write_json(
        CAL_PATH,
        {
            "source": TV_URL,
            "countries": COUNTRIES,
            "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "note": "High-impact TradingView releases plus central-bank policy-rate decisions. Actual and forecast are numbers, not scaled text.",
            "events": events,
        },
    )
    write_json(
        RATE_PATH,
        {
            "source": TV_URL,
            "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "note": "Policy rate is the decision's actual print. changeBp is actual minus previous, in basis points. The rate in force before the first row is that row's previous.",
            "banks": banks,
        },
    )
    print(f"wrote {len(events)} events and {sum(len(rows) for rows in banks.values())} decisions")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
