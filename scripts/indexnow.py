#!/usr/bin/env python3
"""Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep, and others).

Reads the built sitemap, then POSTs to https://api.indexnow.org/indexnow.
Submits URLs that are new or whose lastmod changed since the last successful
submit. The first run after a state file that has no per-URL record submits
the whole sitemap, so growth since the last partial submit is not skipped.
Pass --full to submit every current sitemap URL.
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


def parse_sitemap(path: Path) -> list[tuple[str, str]]:
    """Return (loc, lastmod) pairs. lastmod is "" when the sitemap omits it."""
    tree = ET.parse(path)
    root = tree.getroot()
    entries: list[tuple[str, str]] = []
    seen: set[str] = set()
    nodes = root.findall("sm:url", NS)
    if not nodes:
        nodes = root.findall("url")
    for node in nodes:
        loc_el = node.find("sm:loc", NS)
        if loc_el is None:
            loc_el = node.find("loc")
        mod_el = node.find("sm:lastmod", NS)
        if mod_el is None:
            mod_el = node.find("lastmod")
        loc = (loc_el.text or "").strip() if loc_el is not None else ""
        modified = (mod_el.text or "").strip() if mod_el is not None else ""
        if loc and loc not in seen:
            seen.add(loc)
            entries.append((loc, modified))
    return entries


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


def select_urls(entries: list[tuple[str, str]], state: dict[str, Any], force_full: bool) -> tuple[list[str], str]:
    """Pick URLs IndexNow has not already accepted at this lastmod.

    A state file from the old daily submit has no `submitted` map. That run
    must send every current sitemap URL, because the previous full submit
    covered fewer URLs than the sitemap does now.
    """
    urls = [loc for loc, _mod in entries]
    if force_full:
        return urls, "full-forced"
    submitted = state.get("submitted")
    if not isinstance(submitted, dict):
        return urls, "full-untracked"
    selected: list[str] = []
    grew = False
    changed = False
    for loc, modified in entries:
        previous = submitted.get(loc)
        if previous is None:
            selected.append(loc)
            grew = True
        elif str(previous) != modified:
            selected.append(loc)
            changed = True
    if not selected:
        return [], "none"
    if grew and changed:
        return selected, "new-and-changed"
    if grew:
        return selected, "sitemap-growth"
    return selected, "changed"


def _log_failure(status: int | str, batch: list[str], detail: str) -> None:
    print("indexnow: FAILED", file=sys.stderr)
    print(f"indexnow: endpoint {ENDPOINT}", file=sys.stderr)
    print(f"indexnow: HTTP {status} for {len(batch)} URLs", file=sys.stderr)
    print(f"indexnow: response: {detail.strip() or '(empty)'}", file=sys.stderr)
    if batch:
        print(f"indexnow: batch starts {batch[0]}", file=sys.stderr)
        print(f"indexnow: batch ends {batch[-1]}", file=sys.stderr)


def post_indexnow(host: str, key: str, key_location: str, urls: list[str]) -> tuple[list[int], list[str]]:
    """POST batches. Returns HTTP statuses and the URLs IndexNow accepted."""
    statuses: list[int] = []
    accepted: list[str] = []
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
                if status in {200, 202}:
                    accepted.extend(batch)
                else:
                    _log_failure(status, batch, body)
        except HTTPError as exc:
            err = exc.read().decode("utf-8", errors="replace")
            _log_failure(exc.code, batch, err)
            statuses.append(exc.code)
        except URLError as exc:
            _log_failure(0, batch, str(exc.reason))
            statuses.append(0)
    return statuses, accepted


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--full", action="store_true", help="submit every sitemap URL, ignoring the daily cap")
    parser.add_argument("--dry-run", action="store_true", help="print the URL list without posting")
    args = parser.parse_args()

    config = load_config()
    key, key_location = key_and_location(config)
    host = urlparse(str(config.get("siteUrl") or "https://964fx.com")).netloc
    sitemap = find_sitemap()
    entries = parse_sitemap(sitemap)
    if not entries:
        print("indexnow: FAILED sitemap is empty", file=sys.stderr)
        print(f"indexnow: sitemap {sitemap}", file=sys.stderr)
        return 1

    state = load_state()
    tracked = state.get("submitted")
    tracked_count = len(tracked) if isinstance(tracked, dict) else 0
    urls, reason = select_urls(entries, state, force_full=args.full)
    print(
        f"indexnow: sitemap {sitemap} has {len(entries)} URLs; "
        f"previously tracked {tracked_count}; mode {reason}; submitting {len(urls)}"
    )
    if not urls:
        print("indexnow: nothing to submit")
        return 0
    if args.dry_run:
        for url in urls:
            print(url)
        return 0

    statuses, accepted = post_indexnow(host, key, key_location, urls)
    ok = bool(statuses) and all(status in {200, 202} for status in statuses) and len(accepted) == len(urls)
    lastmods = {loc: modified for loc, modified in entries}
    submitted = dict(tracked) if isinstance(tracked, dict) else {}
    for url in accepted:
        submitted[url] = lastmods.get(url, "")
    current = set(lastmods)
    submitted = {url: modified for url, modified in submitted.items() if url in current}
    new_state = {
        "lastSubmitAt": utc_now(),
        "lastMode": reason,
        "lastCount": len(accepted),
        "lastStatus": statuses[0] if len(statuses) == 1 else statuses,
        "submitted": submitted,
    }
    if not ok:
        failed = [url for url in urls if url not in set(accepted)]
        new_state["lastError"] = f"HTTP {statuses} failed {len(failed)} URLs"
        save_state(new_state)
        print(
            f"indexnow: FAILED {len(failed)} of {len(urls)} URLs were not accepted; they will be retried",
            file=sys.stderr,
        )
        return 1
    save_state(new_state)
    print(f"indexnow: accepted {len(accepted)} URLs; tracked {len(submitted)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
