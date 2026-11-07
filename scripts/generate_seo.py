#!/usr/bin/env python3
"""Write sitemap, robots, and manifest from site.config.json and the data files."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / "site.config.json").read_text(encoding="utf-8"))
site_url = os.environ.get("NEXT_PUBLIC_SITE_URL", config["siteUrl"]).rstrip("/")
stamp = datetime.now(timezone.utc).date().isoformat()

pairs = ["eurusd", "gbpusd", "usdjpy", "usdchf", "audusd", "usdcad", "nzdusd"]
history = json.loads((ROOT / "data/history.json").read_text(encoding="utf-8"))
paths = ["/", "/signals/", "/news/", "/method/", "/archive/"]
paths += [f"/signals/{pair}/" for pair in pairs]
paths += [f"/archive/{item['id']}/" for item in history.get("closed") or [] if item.get("id") and item["id"] != "empty"]

lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for lang in ("ar", "en"):
    for path in paths:
        loc = f"{site_url}/{lang}{path}"
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{stamp}</lastmod>")
        lines.append("  </url>")
lines.append("</urlset>")
(ROOT / "public/sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
(ROOT / "public/robots.txt").write_text(
    f"User-agent: *\nAllow: /\nSitemap: {site_url}/sitemap.xml\n",
    encoding="utf-8",
)
manifest = {
    "name": "964FX",
    "short_name": "964FX",
    "description": "توصيات فوركس عراقية. Iraqi forex signals.",
    "start_url": f"{site_url}/ar/",
    "scope": f"{site_url}/",
    "lang": "ar",
    "dir": "rtl",
    "display": "standalone",
    "background_color": "#07090c",
    "theme_color": "#22c55e",
    "icons": [{"src": f"{site_url}/logo-mark.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}],
}
(ROOT / "public/manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"seo files for {site_url} lastmod {stamp} urls {len(paths) * 2}")
