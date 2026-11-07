#!/usr/bin/env python3
"""Set html lang and dir on the static export so each locale file is correct without JavaScript."""

from __future__ import annotations

import re
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "out"
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
        if relative == "index.html" or relative.startswith("ar/"):
            stamp(html, "ar", "rtl")
        elif relative.startswith("en/"):
            stamp(html, "en", "ltr")


if __name__ == "__main__":
    main()
