#!/usr/bin/env python3
"""POST each newly issued signal to SIGNAL_WEBHOOK_URL once.

Reads open signals from data/signals.json. Dedupe state lives in
data/webhook_state.json so a later run does not post the same id again.
GBPNZD-20261112-BUY is seeded as already sent.

When SIGNAL_WEBHOOK_URL is unset this exits 0 without logging. A failed POST
is logged as a warning, left unmarked, and does not fail the process, so the
Pages deploy keeps going and the next run retries. The webhook key is never
written to the log.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fps_lib import DATA, iso_z, load_json, utc_now

SITE_URL = "https://964fx.com"
STATE_PATH = DATA / "webhook_state.json"
SIGNALS_PATH = DATA / "signals.json"
TIMEOUT = 20
# Open when this notifier shipped. Never post it, even if the state file is missing.
SEEDED_IDS = ("GBPNZD-20261112-BUY",)


class WebhookError(Exception):
    """A POST that should be retried on a later run."""


def redact(text: str) -> str:
    redacted = text
    for name in ("SIGNAL_WEBHOOK_KEY", "SIGNAL_WEBHOOK_URL"):
        value = os.environ.get(name, "").strip()
        if value:
            redacted = redacted.replace(value, "[REDACTED]")
    return redacted


def log(message: str) -> None:
    sys.stdout.write(redact(message) + "\n")
    sys.stdout.flush()


def signal_url(pair: object) -> str:
    return f"{SITE_URL}/ar/signals/{str(pair or '').lower()}/"


def build_payload(signal: dict) -> dict:
    return {
        "event": "new_signal",
        "id": signal.get("id"),
        "pair": signal.get("pair"),
        "direction": signal.get("direction"),
        "entry": signal.get("entry"),
        "sl": signal.get("sl"),
        "tp": signal.get("tp"),
        "issuedAt": signal.get("issuedAt"),
        "url": signal_url(signal.get("pair")),
    }


def load_state() -> dict:
    data = load_json(STATE_PATH)
    if not isinstance(data, dict):
        data = {}
    signals = data.get("signals")
    if not isinstance(signals, dict):
        data["signals"] = {}
    return data


def apply_seed(state: dict) -> bool:
    """Mark seeded ids sent. Returns True when the state dict changed."""
    signals = state.setdefault("signals", {})
    changed = False
    for signal_id in SEEDED_IDS:
        current = signals.get(signal_id)
        if isinstance(current, dict) and current.get("sent"):
            continue
        signals[signal_id] = {"sent": True, "seeded": True}
        changed = True
    return changed


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "signals": state.get("signals") or {},
        "updatedAt": iso_z(utc_now()),
    }
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(STATE_PATH)


def load_open_signals() -> list[dict]:
    doc = load_json(SIGNALS_PATH) or {}
    if not isinstance(doc, dict):
        return []
    opened = []
    for item in doc.get("open") or []:
        if not isinstance(item, dict):
            continue
        signal_id = item.get("id")
        if not signal_id or signal_id == "empty":
            continue
        opened.append(item)
    return opened


def already_sent(state: dict, signal_id: str) -> bool:
    entry = (state.get("signals") or {}).get(signal_id)
    return isinstance(entry, dict) and bool(entry.get("sent"))


def post_webhook(url: str, key: str, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "964FX-webhook",
    }
    if key:
        headers["Authorization"] = f"Bearer {key}"
    request = urllib.request.Request(url, data=body, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            response.read()
    except urllib.error.HTTPError as exc:
        detail = ""
        if exc.fp is not None:
            detail = exc.read().decode("utf-8", errors="replace")[:400]
        raise WebhookError(redact(f"HTTP {exc.code}: {detail}")) from None
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise WebhookError(redact(f"request failed: {exc}")) from None


def deliver(
    open_signals: list[dict],
    state: dict,
    *,
    url: str,
    key: str,
    post=post_webhook,
    on_sent=None,
) -> int:
    """POST each unsent open signal. Returns how many posts failed.

    Successful ids are marked sent before on_sent runs. A failed post is not
    marked, so the next run tries it again.
    """
    failures = 0
    bucket = state.setdefault("signals", {})
    for signal in open_signals:
        signal_id = signal.get("id")
        if not signal_id or signal_id == "empty":
            continue
        signal_id = str(signal_id)
        if already_sent(state, signal_id):
            continue
        payload = build_payload(signal)
        try:
            post(url, key, payload)
        except Exception as exc:  # noqa: BLE001 — keep going, retry next run
            failures += 1
            log(f"webhook: warning: failed to post {signal_id}: {exc}")
            continue
        bucket[signal_id] = {"sent": True, "sentAt": iso_z(utc_now())}
        log(f"webhook: posted {signal_id}")
        if on_sent is not None:
            on_sent()
    return failures


def main() -> int:
    url = os.environ.get("SIGNAL_WEBHOOK_URL", "").strip()
    if not url:
        return 0
    key = os.environ.get("SIGNAL_WEBHOOK_KEY", "").strip()
    try:
        state = load_state()
        if apply_seed(state):
            save_state(state)
        deliver(
            load_open_signals(),
            state,
            url=url,
            key=key,
            post=post_webhook,
            on_sent=lambda: save_state(state),
        )
    except Exception as exc:  # noqa: BLE001 — a notifier must not fail the deploy
        log(f"webhook: warning: {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
