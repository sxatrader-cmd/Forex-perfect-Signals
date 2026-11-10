#!/usr/bin/env python3
"""Replay the live rules over recent weeks.

Prints how many signals the current filters would have issued, and whether
later hourly candles hit the target or the stop. Nothing is written to
data/history.json.
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import (  # noqa: E402
    PAIRS,
    ema,
    empty_fundamentals,
    evaluate_pair,
    fetch_pair_bars,
    fmt_px,
    last_valid,
    resolve_exit,
)

LOOKBACK_DAYS = 21


def main() -> int:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    totals = {"signals": 0, "TP": 0, "SL": 0, "open": 0}
    print(f"replay window {LOOKBACK_DAYS} days ending {now.date().isoformat()} UTC")
    for pair in PAIRS:
        bars = fetch_pair_bars(pair, now_ts)
        daily, h4, h1 = bars["1d"], bars["4h"], bars["1h"]
        last = daily[-1]
        closes = [bar.close for bar in daily]
        ema20 = last_valid(ema(closes, 20))
        ema50 = last_valid(ema(closes, 50))
        ema200 = last_valid(ema(closes, 200))
        last_day = datetime.fromtimestamp(last.ts, timezone.utc).date().isoformat()
        print(
            f"{pair} daily={len(daily)} last={last_day} close={fmt_px(pair, last.close)} "
            f"EMA20={fmt_px(pair, ema20)} EMA50={fmt_px(pair, ema50)} EMA200={fmt_px(pair, ema200)}"
        )
        open_until: datetime | None = None
        outcomes: list[str] = []
        day = (now - timedelta(days=LOOKBACK_DAYS)).replace(hour=5, minute=0, second=0, microsecond=0)
        while day <= now:
            if day.weekday() < 5 and (open_until is None or day >= open_until):
                ts = int(day.timestamp())
                decision = evaluate_pair(
                    pair,
                    [bar for bar in daily if bar.ts <= ts],
                    [bar for bar in h4 if bar.ts + 4 * 3600 <= ts],
                    [bar for bar in h1 if bar.ts + 3600 <= ts],
                    empty_fundamentals(day),
                    day,
                    market_open=True,
                )
                signal = decision.signal
                if signal:
                    future = [bar for bar in h1 if bar.ts >= ts]
                    resolved = resolve_exit(signal["direction"], ts, float(signal["sl"]), float(signal["tp"]), future)
                    if resolved:
                        result, _price, closed_at = resolved
                        open_until = datetime.fromisoformat(closed_at.replace("Z", "+00:00"))
                    else:
                        result = "open"
                        open_until = now + timedelta(days=1)
                    outcomes.append(f"{day.date().isoformat()} {signal['direction']} {result}")
                    totals[result] = totals.get(result, 0) + 1
                    totals["signals"] += 1
            day += timedelta(days=1)
        print("  " + (", ".join(outcomes) if outcomes else "no signal"))
    closed = totals["TP"] + totals["SL"]
    rate = (100.0 * totals["TP"] / closed) if closed else 0.0
    print(
        f"TOTAL signals={totals['signals']} TP={totals['TP']} SL={totals['SL']} "
        f"still_open={totals['open']} win_rate={rate:.0f}% of closed"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
