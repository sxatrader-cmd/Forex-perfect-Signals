#!/usr/bin/env python3
"""Copy data/charts into public/data/charts so the static export serves them."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "data/charts"
dst = ROOT / "public/data/charts"
if dst.exists():
    shutil.rmtree(dst)
dst.mkdir(parents=True, exist_ok=True)
count = 0
for path in sorted(src.glob("*.json")) if src.exists() else []:
    shutil.copy2(path, dst / path.name)
    count += 1
print(f"copied {count} chart files to public/data/charts")
news_src = ROOT / "data/news.json"
if news_src.exists():
    shutil.copy2(news_src, ROOT / "public/news.json")
    print("copied data/news.json to public/news.json")

