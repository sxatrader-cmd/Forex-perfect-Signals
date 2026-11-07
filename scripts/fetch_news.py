#!/usr/bin/env python3
"""Fetch the Forex Factory weekly calendar and enrich released actuals.

On HTTP 429, 5xx, or network errors the previous data/news.json is left as-is.
The file is rewritten only when the event payload changes.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import DATA, FetchError, build_calendar, load_json, utc_now, write_if_content_changed


def main() -> int:
    path = DATA / "news.json"
    previous = load_json(path)
    try:
        events, sources = build_calendar(utc_now())
    except FetchError as exc:
        print(f"calendar fetch failed ({exc}). Keeping the last good file.")
        if previous and previous.get("events"):
            return 0
        payload = {
            "updatedAt": "",
            "error": str(exc),
            "sources": {
                "forexFactory": {"url": "https://nfs.faireconomy.media/ff_calendar_thisweek.json", "ok": False, "events": 0},
                "actuals": {"provider": "TradingView", "ok": False, "matched": 0, "error": str(exc)},
            },
            "events": [],
        }
        changed = write_if_content_changed(path, payload)
        print("wrote empty calendar error state" if changed else "error state unchanged")
        return 0

    payload = {
        "updatedAt": "",
        "error": None,
        "sources": sources,
        "events": events,
    }
    changed = write_if_content_changed(path, payload)
    matched = sources["actuals"]["matched"]
    tv = "ok" if sources["actuals"]["ok"] else f"FAILED {sources['actuals']['error']}"
    print(f"Forex Factory events: {len(events)}")
    print(f"TradingView actuals: {tv}; matched {matched}")
    print("news.json updated" if changed else "news.json unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
