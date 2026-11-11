#!/usr/bin/env python3
"""Post new and closed 964FX signals to the Telegram channel @Code964fx.

Reads data/signals.json and data/history.json. Posts an Arabic then English
message when a signal is issued, and an Arabic then English follow-up when
it closes (as a reply if the original message_id was stored). State lives
in data/telegram_state.json so restarts do not repost. Pre-existing
signals are marked handled and are never posted.

Does not change signal logic. Requires TELEGRAM_BOT_TOKEN, or
TELEGRAM_BOT_TOKEN_964FX on the box. Never logs the token.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import DATA, fmt_px, load_json, utc_now, iso_z

CHAT_ID = -1004215122235
SITE_URL = "https://964fx.com"
IC_LINK = "https://www.ic.com/en/?camp=8117"
STATE_PATH = DATA / "telegram_state.json"
SIGNALS_PATH = DATA / "signals.json"
HISTORY_PATH = DATA / "history.json"
API_ROOT = "https://api.telegram.org"


def token() -> str:
    return (
        os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        or os.environ.get("TELEGRAM_BOT_TOKEN_964FX", "").strip()
    )


def redact(text: str) -> str:
    value = token()
    if not value:
        return text
    return text.replace(value, "[REDACTED]")


def log(message: str) -> None:
    sys.stdout.write(redact(message) + "\n")
    sys.stdout.flush()


def pair_label(pair: str) -> str:
    if len(pair) == 6 and pair.isalpha():
        return f"{pair[:3]}/{pair[3:]}"
    return pair


def pip_size(pair: str) -> float:
    return 0.01 if pair.endswith("JPY") else 0.0001


def risk_pips(signal: dict) -> float | None:
    try:
        entry = float(signal["entry"])
        sl = float(signal["sl"])
    except (KeyError, TypeError, ValueError):
        return None
    size = pip_size(str(signal.get("pair") or ""))
    if size <= 0:
        return None
    return abs(entry - sl) / size


def result_r(signal: dict) -> float | None:
    pips = signal.get("pips")
    risk = risk_pips(signal)
    if isinstance(pips, (int, float)) and risk and risk > 0:
        return pips / risk
    result = str(signal.get("result") or "").upper()
    if result == "TP":
        rr = signal.get("rr")
        return float(rr) if isinstance(rr, (int, float)) else None
    if result == "SL":
        return -1.0
    return None


def fmt_pips(value: float | None) -> str:
    if not isinstance(value, (int, float)):
        return "—"
    return f"{value:+.1f}"


def fmt_r(value: float | None) -> str:
    if not isinstance(value, (int, float)):
        return ""
    return f"{value:+.2f}R"


def fmt_rr(value: object) -> str:
    if not isinstance(value, (int, float)):
        return "—"
    return f"1:{value:.2f}"


def clean_reason(text: object) -> str:
    return " ".join(str(text or "").replace("\n", " ").split())


def reason_blocks(signal: dict, lang: str, limit: int = 3) -> list[str]:
    """Up to 2–3 published reasons in the requested language."""
    lines: list[str] = []
    for item in signal.get("reasons") or []:
        if not isinstance(item, dict):
            continue
        body = clean_reason(item.get(lang) or item.get("en"))
        if body:
            lines.append(body)
        if len(lines) >= limit:
            break
    if lines:
        return [f"{index}. {body}" for index, body in enumerate(lines, start=1)]
    # Fallback if a signal has no stored reasons.
    direction = str(signal.get("direction") or "").upper()
    indicators = signal.get("indicators") or {}
    rsi = indicators.get("rsi4h")
    rsi_txt = f"{rsi:.1f}" if isinstance(rsi, (int, float)) else None
    if lang == "ar":
        text = "اتجاه 4 ساعات صاعد" if direction == "BUY" else "اتجاه 4 ساعات هابط"
        if rsi_txt:
            band = "الشراء" if direction == "BUY" else "البيع"
            text += f"؛ RSI {rsi_txt} داخل نطاق {band}"
        return [text + "."]
    text = "4H trend is bullish" if direction == "BUY" else "4H trend is bearish"
    if rsi_txt:
        band = "buy" if direction == "BUY" else "sell"
        text += f"; RSI {rsi_txt} in the {band} band"
    return [text + "."]


def signal_url(signal: dict, *, closed: bool) -> str:
    if closed:
        return f"{SITE_URL}/ar/archive/{signal['id']}/"
    pair = str(signal.get("pair") or "").lower()
    return f"{SITE_URL}/ar/signals/{pair}/"


def format_issue(signal: dict) -> str:
    pair_code = str(signal.get("pair") or "")
    pair = pair_label(pair_code)
    direction = str(signal.get("direction") or "").upper()
    side_en, side_ar = {"BUY": ("BUY", "شراء"), "SELL": ("SELL", "بيع")}.get(
        direction, (direction, direction)
    )
    entry = fmt_px(pair_code, signal.get("entry"))
    sl = fmt_px(pair_code, signal.get("sl"))
    tp = fmt_px(pair_code, signal.get("tp"))
    rr = fmt_rr(signal.get("rr"))
    reasons_en = reason_blocks(signal, "en")
    reasons_ar = reason_blocks(signal, "ar")
    url = signal_url(signal, closed=False)
    return "\n".join(
        [
            "توصية جديدة 🤩",
            "",
            f"{pair}  {side_ar}",
            f"الدخول: {entry}",
            f"الإيقاف: {sl}",
            f"الهدف: {tp}",
            f"العائد إلى المخاطرة: {rr}",
            "",
            "الأسباب:",
            *reasons_ar,
            "",
            "New Signal 🤩",
            "",
            f"{pair}  {side_en}",
            f"Entry: {entry}",
            f"SL: {sl}",
            f"TP: {tp}",
            f"R:R: {rr}",
            "",
            "Reasons:",
            *reasons_en,
            "",
            f"🔗 {url}",
            "",
            "⚠️ Educational analysis, not financial advice. — تحليل تعليمي وليس نصيحة مالية.",
        ]
    )


def format_close(signal: dict) -> str:
    pair_code = str(signal.get("pair") or "")
    pair = pair_label(pair_code)
    direction = str(signal.get("direction") or "").upper()
    side_en, side_ar = {"BUY": ("BUY", "شراء"), "SELL": ("SELL", "بيع")}.get(
        direction, (direction, direction)
    )
    result = str(signal.get("result") or "").upper()
    hit_tp = result == "TP"
    mark = "✅" if hit_tp else "❌"
    en_title = "Target hit" if hit_tp else "Stop hit"
    ar_title = "تحقق الهدف" if hit_tp else "ضرب الإيقاف"
    pips = fmt_pips(signal.get("pips") if isinstance(signal.get("pips"), (int, float)) else None)
    r_txt = fmt_r(result_r(signal))
    stats_en = f"{pips} pips" if not r_txt else f"{pips} pips ({r_txt})"
    stats_ar = f"{pips} نقطة" if not r_txt else f"{pips} نقطة ({r_txt})"
    close_px = fmt_px(pair_code, signal.get("closePrice") or signal.get("currentPrice"))
    url = signal_url(signal, closed=True)
    return "\n".join(
        [
            f"{mark} {ar_title} — {pair} {side_ar}",
            f"النتيجة: {stats_ar}",
            f"الإغلاق: {close_px}",
            "",
            f"{mark} {en_title} — {pair} {side_en}",
            f"Result: {stats_en}",
            f"Close: {close_px}",
            "",
            f"🔗 {url}",
        ]
    )


def default_state() -> dict:
    return {"initializedAt": "", "signals": {}}


def load_state() -> dict:
    data = load_json(STATE_PATH)
    if not isinstance(data, dict):
        return default_state()
    data.setdefault("initializedAt", "")
    signals = data.get("signals")
    if not isinstance(signals, dict):
        data["signals"] = {}
    return data


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = STATE_PATH.with_suffix(".tmp")
    payload = {
        "initializedAt": state.get("initializedAt") or iso_z(utc_now()),
        "signals": state.get("signals") or {},
        "updatedAt": iso_z(utc_now()),
    }
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(STATE_PATH)


def known_signals() -> tuple[list[dict], list[dict]]:
    signals_doc = load_json(SIGNALS_PATH) or {}
    history_doc = load_json(HISTORY_PATH) or {}
    open_signals = [item for item in signals_doc.get("open") or [] if isinstance(item, dict) and item.get("id")]
    closed_signals = [item for item in history_doc.get("closed") or [] if isinstance(item, dict) and item.get("id")]
    return open_signals, closed_signals


def mark_preexisting(state: dict, records: list[dict]) -> int:
    """Mark known signals as already handled so they are never posted."""
    added = 0
    bucket = state.setdefault("signals", {})
    for record in records:
        signal_id = record["id"]
        if signal_id in bucket:
            continue
        bucket[signal_id] = {
            "issued": True,
            "closed": record.get("status") == "closed" or bool(record.get("result")),
            "message_id": None,
            "closed_message_id": None,
            "skipped": "preexisting",
        }
        added += 1
    if not state.get("initializedAt"):
        state["initializedAt"] = iso_z(utc_now())
    return added


def entry_for(state: dict, signal_id: str) -> dict:
    bucket = state.setdefault("signals", {})
    if signal_id not in bucket:
        bucket[signal_id] = {
            "issued": False,
            "closed": False,
            "message_id": None,
            "closed_message_id": None,
        }
    return bucket[signal_id]


def send_message(text: str, *, reply_to: int | None = None, dry_run: bool = False) -> int | None:
    if dry_run:
        log("----- DRY RUN (not sent) -----")
        log(text)
        log("----- END DRY RUN -----")
        return None
    bot_token = token()
    if not bot_token:
        raise SystemExit("telegram: TELEGRAM_BOT_TOKEN is not set")
    payload: dict = {
        "chat_id": CHAT_ID,
        "text": text,
        "disable_web_page_preview": True,
    }
    if reply_to:
        payload["reply_to_message_id"] = reply_to
        payload["allow_sending_without_reply"] = True
    body = json.dumps(payload).encode("utf-8")
    url = f"{API_ROOT}/bot{bot_token}/sendMessage"
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "User-Agent": "964FX-telegram"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        raise RuntimeError(redact(f"telegram HTTP {exc.code}: {detail[:400]}")) from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(redact(f"telegram request failed: {exc}")) from None
    if not raw.get("ok"):
        raise RuntimeError(redact(f"telegram API error: {raw}"))
    message_id = (raw.get("result") or {}).get("message_id")
    if not isinstance(message_id, int):
        raise RuntimeError("telegram response had no message_id")
    return message_id


def sample_record(open_signals: list[dict], closed_signals: list[dict]) -> dict | None:
    if closed_signals:
        return closed_signals[-1]
    if open_signals:
        return open_signals[0]
    return None


def process(state: dict, open_signals: list[dict], closed_signals: list[dict], *, dry_run: bool) -> int:
    """Post new issues and closes. Returns the number of failed posts."""
    failures = 0
    by_id = {item["id"]: item for item in closed_signals}
    for item in open_signals:
        by_id[item["id"]] = item

    # Issues: only currently open signals that are not yet marked issued.
    for signal in open_signals:
        entry = entry_for(state, signal["id"])
        if entry.get("issued") or entry.get("skipped"):
            continue
        try:
            message_id = send_message(format_issue(signal), dry_run=dry_run)
            log(f"telegram: {'would post' if dry_run else 'posted'} issue {signal['id']}" + (f" message_id={message_id}" if message_id else ""))
            if not dry_run:
                entry["issued"] = True
                entry["message_id"] = message_id
                entry["postedAt"] = iso_z(utc_now())
                save_state(state)
        except Exception as exc:  # noqa: BLE001 — keep going, retry next run
            failures += 1
            log(f"telegram: failed to post issue {signal['id']}: {exc}")

    # Closes: only signals we already posted (or marked issued) and have not closed.
    # Unknown closed ids are marked preexisting and never posted.
    for signal in closed_signals:
        signal_id = signal["id"]
        if signal_id not in state.get("signals", {}):
            mark_preexisting(state, [signal])
            if not dry_run:
                save_state(state)
            log(f"telegram: marked preexisting closed signal {signal_id}, will not post")
            continue
        entry = entry_for(state, signal_id)
        if entry.get("closed") or entry.get("skipped"):
            continue
        if not entry.get("issued"):
            # We never posted the open message; do not send a close-only update.
            entry["closed"] = True
            entry["skipped"] = "close-without-issue"
            if not dry_run:
                save_state(state)
            log(f"telegram: skip close {signal_id} (issue was never posted)")
            continue
        reply_to = entry.get("message_id") if isinstance(entry.get("message_id"), int) else None
        try:
            message_id = send_message(format_close(signal), reply_to=reply_to, dry_run=dry_run)
            log(f"telegram: {'would post' if dry_run else 'posted'} close {signal_id}" + (f" message_id={message_id}" if message_id else ""))
            if not dry_run:
                entry["closed"] = True
                entry["closed_message_id"] = message_id
                entry["closedAt"] = iso_z(utc_now())
                save_state(state)
        except Exception as exc:  # noqa: BLE001
            failures += 1
            log(f"telegram: failed to post close {signal_id}: {exc}")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Post 964FX signals to Telegram")
    parser.add_argument("--dry-run", action="store_true", help="Print messages to the log, do not send or write state")
    parser.add_argument("--sample", action="store_true", help="Print sample issue and close messages from the latest known signal")
    args = parser.parse_args()

    open_signals, closed_signals = known_signals()
    state = load_state()

    if not state.get("initializedAt") or not state.get("signals"):
        added = mark_preexisting(state, open_signals + closed_signals)
        if not args.dry_run:
            save_state(state)
        log(f"telegram: initialized state, marked {added} existing signal(s) as handled")
    else:
        # New state file already present; still refuse to post anything already known
        # at init time that might have been missed.
        pass

    if args.sample:
        record = sample_record(open_signals, closed_signals)
        if record is None:
            log("telegram: no signal available to format a sample")
        else:
            log("===== SAMPLE ISSUE (not sent) =====")
            log(format_issue(record))
            log("===== SAMPLE CLOSE (not sent) =====")
            log(format_close(record))
            log("===== END SAMPLE =====")

    if args.dry_run and not args.sample:
        # Show what this run would post (normally nothing once preexisting are marked).
        failures = process(state, open_signals, closed_signals, dry_run=True)
        if failures:
            return 1
        log("telegram: dry-run complete")
        return 0

    if args.dry_run:
        log("telegram: dry-run/sample complete; nothing sent")
        return 0

    if not token():
        log("telegram: no token set; skipping posts")
        return 1

    failures = process(state, open_signals, closed_signals, dry_run=False)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
