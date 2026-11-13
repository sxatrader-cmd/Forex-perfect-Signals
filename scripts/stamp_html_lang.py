#!/usr/bin/env python3
"""Set html lang/dir, and preload only the font files for that page's script.

next/font is configured with preload:false because the root layout is shared by
every language. This pass reads the built @font-face rules and inserts
<link rel="preload"> for the subsets the current language actually uses.
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urljoin

OUT = Path(__file__).resolve().parents[1] / "out"
# Route segment -> (html lang, dir). Keep in step with src/lib/langs.ts.
LANGS = {
    "ar": ("ar", "rtl"),
    "en": ("en", "ltr"),
    "zh-cn": ("zh-CN", "ltr"),
    "zh-tw": ("zh-TW", "ltr"),
    "fr": ("fr", "ltr"),
    "de": ("de", "ltr"),
    "es": ("es", "ltr"),
    "pt": ("pt", "ltr"),
    "ru": ("ru", "ltr"),
    "hi": ("hi", "ltr"),
    "ta": ("ta", "ltr"),
    "tr": ("tr", "ltr"),
    "fa": ("fa", "rtl"),
}
# (next/font CSS variable, unicode script) pairs to preload. Display face --font-display is omitted.
NEEDED: dict[str, tuple[tuple[str, str], ...]] = {
    "ar": (("ibm", "arabic"), ("ibm", "latin")),
    "fa": (("vazir", "arabic"), ("ibm", "latin")),
    "ru": (("plex", "cyrillic"), ("ibm", "latin")),
    "hi": (("deva", "devanagari"), ("ibm", "latin")),
    "ta": (("tamil", "tamil"), ("ibm", "latin")),
    "en": (("ibm", "latin"),),
    "zh-cn": (("ibm", "latin"),),
    "zh-tw": (("ibm", "latin"),),
    "fr": (("ibm", "latin"), ("ibm", "latin-ext")),
    "de": (("ibm", "latin"), ("ibm", "latin-ext")),
    "es": (("ibm", "latin"), ("ibm", "latin-ext")),
    "pt": (("ibm", "latin"), ("ibm", "latin-ext")),
    "tr": (("ibm", "latin"), ("ibm", "latin-ext")),
}
HTML = re.compile(r"<html\b[^>]*>", re.IGNORECASE)
STYLE = re.compile(r"<style\b[^>]*>(.*?)</style>", re.IGNORECASE | re.DOTALL)
STYLESHEET = re.compile(r'<link\b[^>]*rel="stylesheet"[^>]*>', re.IGNORECASE)
HREF = re.compile(r'href="([^"]+)"')
FACE = re.compile(r"@font-face\s*\{([^}]*)\}", re.IGNORECASE)
VAR = re.compile(r"--font-([A-Za-z0-9_-]+)\s*:\s*(['\"])(.*?)\2")
FONT_PRELOAD = re.compile(r'\s*<link\b[^>]*\bas="font"[^>]*>', re.IGNORECASE)
RANGE = re.compile(r"U\+([0-9A-Fa-f?]{1,6})(?:-([0-9A-Fa-f?]{1,6}))?", re.IGNORECASE)
_css_cache: dict[str, str] = {}


def _expand_token(token: str) -> tuple[int, int]:
    """Expand a unicode-range token. `?` is a nibble wildcard (`U+6??` is U+0600-06FF)."""
    low = int(token.replace("?", "0"), 16)
    high = int(token.replace("?", "F"), 16)
    return (low, high) if low <= high else (high, low)


def _intervals(text: str) -> list[tuple[int, int]]:
    found: list[tuple[int, int]] = []
    for start_token, end_token in RANGE.findall(text):
        if end_token:
            start, _ = _expand_token(start_token)
            _, end = _expand_token(end_token)
        else:
            start, end = _expand_token(start_token)
        if end < start:
            start, end = end, start
        found.append((start, end))
    return found


def _covered(spans: list[tuple[int, int]], low: int, high: int) -> int:
    total = 0
    for start, end in spans:
        left, right = max(start, low), min(end, high)
        if right >= left:
            total += right - left + 1
    return total


def scripts_in(unicode_range: str) -> set[str]:
    spans = _intervals(unicode_range)
    found: set[str] = set()
    if _covered(spans, 0x0041, 0x005A) >= 20:
        found.add("latin")
    if _covered(spans, 0x0100, 0x017F) >= 40:
        found.add("latin-ext")
    if _covered(spans, 0x0400, 0x04FF) >= 40:
        found.add("cyrillic")
    if _covered(spans, 0x0600, 0x06FF) >= 40:
        found.add("arabic")
    if _covered(spans, 0x0900, 0x097F) >= 40:
        found.add("devanagari")
    if _covered(spans, 0x0B80, 0x0BFF) >= 40:
        found.add("tamil")
    return found


def _read_css(href: str) -> str:
    if href in _css_cache:
        return _css_cache[href]
    path = href.split("?", 1)[0]
    if path.startswith("/"):
        file = OUT / path.lstrip("/")
    else:
        file = OUT / path
    text = file.read_text(encoding="utf-8") if file.is_file() else ""
    _css_cache[href] = text
    return text


def page_styles(html: str) -> list[tuple[str, str]]:
    """(base URL, css text). Font urls are resolved against the stylesheet, not the page."""
    parts = [("", match.group(1)) for match in STYLE.finditer(html)]
    for tag in STYLESHEET.findall(html):
        href = HREF.search(tag)
        if href:
            url = href.group(1)
            parts.append((url.split("?", 1)[0], _read_css(url)))
    return parts


def font_preloads(styles: list[tuple[str, str]], route: str) -> list[str]:
    needed = set(NEEDED.get(route, ()))
    if not needed:
        return []
    family_var: dict[str, str] = {}
    for _base, css in styles:
        for name, _quote, value in VAR.findall(css):
            family = value.split(",")[0].strip().strip("'\"")
            if family:
                family_var.setdefault(family, name)
    urls: list[str] = []
    seen: set[str] = set()
    for base, css in styles:
        for block in FACE.findall(css):
            family_match = re.search(r"font-family\s*:\s*([^;]+)", block, re.IGNORECASE)
            range_match = re.search(r"unicode-range\s*:\s*([^;]+)", block, re.IGNORECASE)
            if not family_match or not range_match:
                continue
            family = family_match.group(1).strip().strip("'\"")
            variable = family_var.get(family)
            if not variable or variable == "display":
                continue
            scripts = scripts_in(range_match.group(1))
            if not any((variable, script) in needed for script in scripts):
                continue
            for raw in re.findall(r"url\(([^)]+\.woff2)\)", block, re.IGNORECASE):
                url = raw.strip().strip("'\"")
                if base:
                    url = urljoin(base, url)
                if url in seen:
                    continue
                seen.add(url)
                urls.append(url)
    return urls


def _preload_tags(urls: list[str]) -> str:
    return "".join(
        f'<link rel="preload" href="{url}" as="font" type="font/woff2" crossorigin="anonymous"/>'
        for url in urls
    )


def stamp(path: Path, route: str, lang: str, direction: str) -> int:
    text = path.read_text(encoding="utf-8")
    text = FONT_PRELOAD.sub("", text)

    def repl(match: re.Match[str]) -> str:
        tag = re.sub(r'\slang="[^"]*"', "", match.group(0))
        tag = re.sub(r'\sdir="[^"]*"', "", tag)
        return tag[:-1] + f' lang="{lang}" dir="{direction}">'

    text, count = HTML.subn(repl, text, count=1)
    urls = font_preloads(page_styles(text), route)
    if urls and "<head>" in text:
        text = text.replace("<head>", "<head>" + _preload_tags(urls), 1)
    if count or urls:
        path.write_text(text, encoding="utf-8")
    return len(urls)


def main() -> None:
    if not OUT.exists():
        return
    counts: dict[str, int] = {}
    for html in OUT.rglob("*.html"):
        relative = html.relative_to(OUT).as_posix()
        if relative in {"index.html", "404.html"}:
            route = "ar"
            counts[route] = stamp(html, route, "ar", "rtl")
            continue
        segment = relative.split("/", 1)[0]
        if segment in LANGS:
            lang, direction = LANGS[segment]
            counts[segment] = stamp(html, segment, lang, direction)
    for route in NEEDED:
        print(f"font preload {route}: {counts.get(route, 0)} woff2")


if __name__ == "__main__":
    main()
