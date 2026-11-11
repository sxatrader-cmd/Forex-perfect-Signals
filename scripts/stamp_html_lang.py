#!/usr/bin/env python3
"""Set html lang and dir on the static export so each locale file is correct without JavaScript."""

from __future__ import annotations

import re
from pathlib import Path

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
HTML = re.compile(r"<html\b[^>]*>", re.IGNORECASE)


def stamp(path: Path, lang: str, direction: str) -> None:
    text = path.read_text(encoding="utf-8")

    def repl(match: re.Match[str]) -> str:
        tag = re.sub(r'\slang="[^"]*"', "", match.group(0))
        tag = re.sub(r'\sdir="[^"]*"', "", tag)
        return tag[:-1] + f' lang="{lang}" dir="{direction}">'

    updated, count = HTML.subn(repl, text, count=1)
    if count:
        path.write_text(updated, encoding="utf-8")


def main() -> None:
    if not OUT.exists():
        return
    for html in OUT.rglob("*.html"):
        relative = html.relative_to(OUT).as_posix()
        if relative == "index.html":
            stamp(html, "ar", "rtl")
            continue
        segment = relative.split("/", 1)[0]
        if segment in LANGS:
            stamp(html, *LANGS[segment])


if __name__ == "__main__":
    main()
