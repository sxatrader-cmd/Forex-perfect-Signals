#!/usr/bin/env python3
"""Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep, and others).

Reads the built sitemap, then POSTs to https://api.indexnow.org/indexnow.
By default only new or changed signal/archive pages are submitted. A full
sitemap submit happens at most once per UTC day, or when --full is passed.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "data" / "indexnow_state.json"
ENDPOINT = "https://api.indexnow.org/indexnow"
MAX_URLS = 10000
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def utc_today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_config() -> dict[str, Any]:
    return json.loads((ROOT / "site.config.json").read_text(encoding="utf-8"))


def key_and_location(config: dict[str, Any]) -> tuple[str, str]:
    site_url = str(config.get("siteUrl") or "https://964fx.com").rstrip("/")
    key = str(config.get("indexNowKey") or "").strip()
    if not key:
        for path in sorted((ROOT / "public").glob("*.txt")):
            body = path.read_text(encoding="utf-8").strip()
            if body == path.stem and 8 <= len(body) <= 128:
                key = body
                break
    if not key:
        raise SystemExit("indexnow: no indexNowKey in site.config.json and no key file in public/")
    key_file = ROOT / "public" / f"{key}.txt"
    if not key_file.is_file() or key_file.read_text(encoding="utf-8").strip() != key:
        raise SystemExit(f"indexnow: public/{key}.txt is missing or does not contain the key")
    return key, f"{site_url}/{key}.txt"


def find_sitemap() -> Path:
    for candidate in (ROOT / "out" / "sitemap.xml", ROOT / "public" / "sitemap.xml"):
        if candidate.is_file():
            return candidate
    raise SystemExit("indexnow: sitemap.xml not found in out/ or public/")


def parse_sitemap(path: Path) -> list[str]:
    tree = ET.parse(path)
    root = tree.getroot()
    urls: list[str] = []
    seen: set[str] = set()
    for node in root.findall("sm:url", NS) or root.findall("url"):
        loc_el = node.find("sm:loc", NS)
        if loc_el is None:
            loc_el = node.find("loc")
        loc = (loc_el.text or "").strip() if loc_el is not None else ""
        if loc and loc not in seen:
            seen.add(loc)
            urls.append(loc)
    return urls


def compact_signals() -> dict[str, list[dict[str, Any]]]:
    signals = json.loads((ROOT / "data" / "signals.json").read_text(encoding="utf-8"))
    history = json.loads((ROOT / "data" / "history.json").read_text(encoding="utf-8"))

    def rows(items: list[Any], extra: tuple[str, ...]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for item in items or []:
            if not isinstance(item, dict) or not item.get("id") or item.get("id") == "empty":
                continue
            row = {
                "id": item.get("id"),
                "pair": item.get("pair"),
                "direction": item.get("direction"),
                "entry": item.get("entry"),
                "sl": item.get("sl"),
                "tp": item.get("tp"),
                "status": item.get("status"),
                "issuedAt": item.get("issuedAt"),
            }
            for field in extra:
                row[field] = item.get(field)
            out.append(row)
        out.sort(key=lambda row: str(row.get("id") or ""))
        return out

    open_items = signals.get("open") or []
    closed_items = history.get("closed") or []
    return {
        "open": rows(open_items, ()),
        "closed": rows(closed_items, ("priceAsOf", "currentPrice")),
    }


def page_key(url: str) -> str:
    path = urlparse(url).path or "/"
    parts = [part for part in path.split("/") if part]
    if parts:
        return "/" + "/".join(parts[1:]) + ("/" if path.endswith("/") else "")
    return "/"


def changed_page_keys(prev: dict[str, Any], curr: dict[str, list[dict[str, Any]]]) -> set[str]:
    keys: set[str] = set()

    def index(items: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
        return {str(item["id"]): item for item in items if item.get("id")}

    prev_open = index(prev.get("open") or [])
    curr_open = index(curr.get("open") or [])
    prev_closed = index(prev.get("closed") or [])
    curr_closed = index(curr.get("closed") or [])

    def pair_key(pair: Any) -> str | None:
        if not pair:
            return None
        return f"/signals/{str(pair).lower()}/"

    ids = set(prev_open) | set(curr_open) | set(prev_closed) | set(curr_closed)
    for sid in ids:
        before = prev_open.get(sid) or prev_closed.get(sid)
        after = curr_open.get(sid) or curr_closed.get(sid)
        if before == after:
            continue
        pair = (after or before or {}).get("pair")
        path = pair_key(pair)
        if path:
            keys.add(path)
        if after and sid in curr_closed and sid not in prev_closed:
            keys.add(f"/archive/{sid}/")
            keys.add("/archive/")
            keys.add("/signals/")
        elif after and sid in curr_closed and before != after:
            keys.add(f"/archive/{sid}/")
    return keys


def load_state() -> dict[str, Any]:
    if not STATE_PATH.is_file():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def select_urls(all_urls: list[str], state: dict[str, Any], force_full: bool) -> tuple[list[str], str]:
    today = utc_today()
    last_full = str(state.get("lastFullSubmit") or "")
    if force_full or not last_full or last_full < today:
        reason = "full-forced" if force_full else ("full-first" if not last_full else "full-daily")
        return all_urls, reason
    curr = compact_signals()
    keys = changed_page_keys(state.get("signals") or {}, curr)
    if not keys:
        return [], "none"
    selected = [url for url in all_urls if page_key(url) in keys]
    return selected, "changed-signals"


def post_indexnow(host: str, key: str, key_location: str, urls: list[str]) -> list[int]:
    statuses: list[int] = []
    for start in range(0, len(urls), MAX_URLS):
        batch = urls[start : start + MAX_URLS]
        payload = json.dumps(
            {"host": host, "key": key, "keyLocation": key_location, "urlList": batch},
            ensure_ascii=False,
        ).encode("utf-8")
        req = Request(
            ENDPOINT,
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "964FX-indexnow/1.0"},
        )
        try:
            with urlopen(req, timeout=60) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                status = resp.getcode()
                print(f"indexnow: POST {ENDPOINT} -> HTTP {status} ({len(batch)} URLs)")
                if body.strip():
                    print(body.strip())
                statuses.append(status)
        except HTTPError as exc:
            err = exc.read().decode("utf-8", errors="replace")
            print(f"indexnow: POST {ENDPOINT} -> HTTP {exc.code} ({len(batch)} URLs)", file=sys.stderr)
            if err.strip():
                print(err.strip(), file=sys.stderr)
            statuses.append(exc.code)
        except URLError as exc:
            print(f"indexnow: POST {ENDPOINT} failed: {exc.reason}", file=sys.stderr)
            statuses.append(0)
    return statuses


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--full", action="store_true", help="submit every sitemap URL, ignoring the daily cap")
    parser.add_argument("--dry-run", action="store_true", help="print the URL list without posting")
    args = parser.parse_args()

    config = load_config()
    key, key_location = key_and_location(config)
    host = urlparse(str(config.get("siteUrl") or "https://964fx.com")).netloc
    sitemap = find_sitemap()
    all_urls = parse_sitemap(sitemap)
    if not all_urls:
        print("indexnow: sitemap is empty", file=sys.stderr)
        return 1

    state = load_state()
    urls, reason = select_urls(all_urls, state, force_full=args.full)
    print(f"indexnow: sitemap {sitemap} ({len(all_urls)} URLs), mode {reason}, submitting {len(urls)}")
    if not urls:
        print("indexnow: nothing to submit")
        return 0
    if args.dry_run:
        for url in urls:
            print(url)
        return 0

    statuses = post_indexnow(host, key, key_location, urls)
    ok = all(status in {200, 202} for status in statuses)
    state = {
        "lastSubmitAt": utc_now(),
        "lastMode": reason,
        "lastCount": len(urls),
        "lastStatus": statuses[0] if len(statuses) == 1 else statuses,
        "signals": compact_signals(),
    }
    if reason.startswith("full") and ok:
        state["lastFullSubmit"] = utc_today()
    else:
        prev_full = load_state().get("lastFullSubmit")
        if prev_full:
            state["lastFullSubmit"] = prev_full
    save_state(state)
    if not ok:
        print("indexnow: submission failed", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
