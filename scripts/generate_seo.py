#!/usr/bin/env python3
"""Write sitemap, robots, llms.txt, and manifest from site.config.json and the data files."""

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
signals = json.loads((ROOT / "data/signals.json").read_text(encoding="utf-8"))
paths = ["/", "/signals/", "/news/", "/calendar/", "/method/", "/archive/"]
paths += [f"/signals/{pair}/" for pair in pairs]
paths += [f"/archive/{item['id']}/" for item in history.get("closed") or [] if item.get("id") and item["id"] != "empty"]

# Route segment -> hreflang tag. Keep in step with src/lib/langs.ts.
LANGS = {
    "ar": "ar",
    "en": "en",
    "zh-cn": "zh-CN",
    "zh-tw": "zh-TW",
    "fr": "fr",
    "de": "de",
    "es": "es",
    "pt": "pt",
    "ru": "ru",
    "hi": "hi",
    "ta": "ta",
    "tr": "tr",
    "fa": "fa",
}

LANG_LABELS = {
    "ar": "العربية",
    "en": "English",
    "zh-cn": "简体中文",
    "zh-tw": "繁體中文",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "pt": "Português",
    "ru": "Русский",
    "hi": "हिन्दी",
    "ta": "தமிழ்",
    "tr": "Türkçe",
    "fa": "فارسی",
}

AI_BOTS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "Bingbot",
]

IB_URL = "https://www.ic.com/en/?camp=8117"

# Hand-written guides. Keep in step with src/lib/guides/nav.ts.
GUIDE_LANGS = ["ar", "en", "ru", "fr", "de", "es"]
GUIDE_SLUGS = ["xauusd-gold", "islamic-swap-free-account", "forex-for-beginners", "demo-account", "leverage"]
guide_paths = ["/guides/"] + [f"/guides/{slug}/" for slug in GUIDE_SLUGS]
GUIDE_TITLES = {
    "en": {
        "/guides/": ("Forex guides", "Index of 964FX guides"),
        "xauusd-gold": ("XAUUSD gold", "Live XAUUSD chart and what moves gold: the dollar, US rates, CPI, NFP"),
        "islamic-swap-free-account": ("Is forex halal? Islamic swap-free accounts", "What a swap-free account changes, scholars' questions, IC Markets' swap-free option"),
        "forex-for-beginners": ("Forex for beginners", "Pairs, pips, lots, and how to read a 964FX signal"),
        "demo-account": ("Forex demo account", "Practising with virtual money and a checklist before going live"),
        "leverage": ("Leverage explained", "Leverage and margin with examples, margin call, retail limits"),
    },
    "ar": {
        "/guides/": ("أدلة الفوركس", "فهرس أدلة 964FX"),
        "xauusd-gold": ("تحليل الذهب XAUUSD", "شارت الذهب المباشر وما الذي يحرك الذهب"),
        "islamic-swap-free-account": ("هل الفوركس حلال؟ الحساب الإسلامي", "ما يغيّره الحساب بدون سواب والمسائل الشرعية وخيار IC Markets"),
        "forex-for-beginners": ("تعلم الفوركس للمبتدئين", "الأزواج والنقاط واللوت وكيف تقرأ توصية 964FX"),
        "demo-account": ("الحساب التجريبي", "التدرب بأموال افتراضية وقائمة التحقق قبل الحساب الحقيقي"),
        "leverage": ("الرافعة المالية", "الرافعة والهامش بالأمثلة وحدود الرافعة"),
    },
}
PAIR_CODES = [pair.upper() for pair in pairs]


def write_sitemap() -> int:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    for lang in LANGS:
        for path in paths:
            loc = f"{site_url}/{lang}{path}"
            lines.append("  <url>")
            lines.append(f"    <loc>{loc}</loc>")
            lines.append(f"    <lastmod>{stamp}</lastmod>")
            for code, tag in LANGS.items():
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{tag}" href="{site_url}/{code}{path}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{site_url}/ar{path}"/>')
            lines.append("  </url>")
    for lang in GUIDE_LANGS:
        for path in guide_paths:
            lines.append("  <url>")
            lines.append(f"    <loc>{site_url}/{lang}{path}</loc>")
            lines.append(f"    <lastmod>{stamp}</lastmod>")
            for code in GUIDE_LANGS:
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{LANGS[code]}" href="{site_url}/{code}{path}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{site_url}/ar{path}"/>')
            lines.append("  </url>")
    for extra in ("/llms.txt", "/llms-full.txt"):
        lines.append("  <url>")
        lines.append(f"    <loc>{site_url}{extra}</loc>")
        lines.append(f"    <lastmod>{stamp}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    (ROOT / "public/sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(paths) * len(LANGS) + len(guide_paths) * len(GUIDE_LANGS) + 2


def write_robots() -> None:
    lines: list[str] = []
    for bot in AI_BOTS:
        lines.append(f"User-agent: {bot}")
        lines.append("Allow: /")
        lines.append("")
    lines.append("User-agent: *")
    lines.append("Allow: /")
    lines.append("")
    lines.append(f"Sitemap: {site_url}/sitemap.xml")
    lines.append("")
    (ROOT / "public/robots.txt").write_text("\n".join(lines), encoding="utf-8")


def _fmt_levels(item: dict) -> str:
    return f"entry {item.get('entry')}, SL {item.get('sl')}, TP {item.get('tp')}"


def _reason(item: dict, lang: str) -> str:
    parts: list[str] = []
    for reason in item.get("reasons") or []:
        if isinstance(reason, dict):
            text = (reason.get(lang) or reason.get("en") or "").strip()
            if text:
                parts.append(text)
    return " ".join(parts)


def _guide_links(lang: str) -> str:
    titles = GUIDE_TITLES[lang]
    out = ""
    for path in guide_paths:
        key = "/guides/" if path == "/guides/" else path.strip("/").split("/")[-1]
        name, note = titles[key]
        out += f"- [{name}]({site_url}/{lang}{path}): {note}\n"
    return out


def write_llms() -> None:
    updated = str(signals.get("updatedAt") or stamp)
    open_items = [item for item in (signals.get("open") or []) if isinstance(item, dict) and item.get("id") and item["id"] != "empty"]
    closed_items = [item for item in (history.get("closed") or []) if isinstance(item, dict) and item.get("id") and item["id"] != "empty"]

    llms = f"""# 964FX

> Free forex signals for the major pairs, with fundamental and technical reasons, live Forex Factory news, and a public archive. Run by Saif, an IC Markets introducing broker (IB).

964FX is an educational forex desk from Iraq. Signals are free, cover the majors (EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD), and are published only when the setup is complete. A pair with an open signal does not get another until the previous one hits its take-profit or stop-loss. This is automated educational analysis, not financial advice.

سيف التميمي وسيط معرّف (IB) لدى IC Markets: {IB_URL}

The site is available in 13 languages. Arabic is the default.

## العربية

- [الرئيسية]({site_url}/ar/): نظرة عامة على مكتب 964FX والإشارات التعليمية
- [الإشارات]({site_url}/ar/signals/): التوصيات اليومية للأزواج الرئيسية مع الإيقاف والهدف وستة أسباب
- [الأخبار]({site_url}/ar/news/): المفكرة الاقتصادية وأخبار Forex Factory بتوقيت بغداد
- [التقويم الاقتصادي]({site_url}/ar/calendar/): التقويم الاقتصادي للأسبوع، مع الأثر والفعلي والتوقع والسابق
- [المنهج]({site_url}/ar/method/): قواعد بناء الإشارة، ولماذا يُتخطى الزوج أحياناً
- [الأرشيف]({site_url}/ar/archive/): السجل العلني للإشارات المغلقة مع النتيجة والنقاط
"""
    for pair in PAIR_CODES:
        slug = pair.lower()
        llms += f"- [{pair}]({site_url}/ar/signals/{slug}/): صفحة زوج {pair}\n"

    llms += _guide_links("ar")
    llms += f"""
## English

- [Home]({site_url}/en/): Overview of the 964FX educational desk
- [Signals]({site_url}/en/signals/): Daily major-pair signals with stop, target, and six reasons
- [News]({site_url}/en/news/): This week's economic calendar and live Forex Factory news
- [Economic calendar]({site_url}/en/calendar/): This week's economic calendar, with impact, actual, forecast, and previous
- [Method]({site_url}/en/method/): How a signal is built, and when a pair is skipped
- [Archive]({site_url}/en/archive/): Public record of closed signals, with results and pips
"""
    for pair in PAIR_CODES:
        slug = pair.lower()
        llms += f"- [{pair}]({site_url}/en/signals/{slug}/): {pair} signal page\n"

    llms += _guide_links("en")
    llms += "\n## Guides in other languages\n\n"
    for lang in GUIDE_LANGS:
        if lang in ("ar", "en"):
            continue
        llms += f"- [{LANG_LABELS[lang]}]({site_url}/{lang}/guides/): XAUUSD gold, Islamic swap-free account, beginners, demo account, leverage\n"
    llms += f"""
## Optional

- [Full site brief]({site_url}/llms-full.txt): Longer description, current signals, and recent archive entries
- [Sitemap]({site_url}/sitemap.xml)
"""
    (ROOT / "public/llms.txt").write_text(llms, encoding="utf-8")

    full = f"""# 964FX

> Free forex signals for the major pairs, with fundamental and technical reasons, live Forex Factory news, transparent tracking, and a public archive.

964FX is an educational forex website from Iraq, operated by Saif Altamimi, an Introducing Broker (IB) for IC Markets. The IB referral link is {IB_URL}. The analysis on the site is automated and educational. It is not financial advice, and it is not an invitation to trade. Forex and CFDs are high risk; past results do not guarantee future results.

A daily signal may be issued for a major pair only when the setup is complete (trend, RSI, MACD, distance to the stop and target, and the calendar). There is at most one open signal per pair, and no new signal is published on that pair until the previous one hits take-profit (TP) or stop-loss (SL). Quiet days stay quiet. Closed results are kept in the public archive and are not deleted or edited.

Data last updated: {updated}

## Arabic pages

- Home: {site_url}/ar/
- Signals: {site_url}/ar/signals/
- News: {site_url}/ar/news/
- Economic calendar: {site_url}/ar/calendar/
- Method: {site_url}/ar/method/
- Archive: {site_url}/ar/archive/
"""
    for pair in PAIR_CODES:
        full += f"- {pair}: {site_url}/ar/signals/{pair.lower()}/\n"

    full += f"""
## English pages

- Home: {site_url}/en/
- Signals: {site_url}/en/signals/
- News: {site_url}/en/news/
- Economic calendar: {site_url}/en/calendar/
- Method: {site_url}/en/method/
- Archive: {site_url}/en/archive/
"""
    for pair in PAIR_CODES:
        full += f"- {pair}: {site_url}/en/signals/{pair.lower()}/\n"

    full += "\n## Guides\n\nEvergreen guides, written separately for each language (not machine translations), each with FAQ structured data, a risk warning, and the IB disclosure:\n\n"
    for lang in GUIDE_LANGS:
        for slug in GUIDE_SLUGS:
            full += f"- {LANG_LABELS[lang]} · {slug}: {site_url}/{lang}/guides/{slug}/\n"

    full += "\n## Open signals\n\n"
    if not open_items:
        full += "No open signal right now. A new one is issued only when the setup is complete.\n"
    else:
        for item in open_items:
            pair = item.get("pair")
            direction = item.get("direction")
            issued = item.get("issuedAt")
            slug = str(pair or "").lower()
            full += (
                f"- {pair} {direction}, issued {issued}. {_fmt_levels(item)}. "
                f"Arabic: {site_url}/ar/signals/{slug}/ — English: {site_url}/en/signals/{slug}/\n"
            )
            reason_en = _reason(item, "en")
            reason_ar = _reason(item, "ar")
            if reason_en:
                full += f"  Reasons (EN): {reason_en}\n"
            if reason_ar:
                full += f"  الأسباب: {reason_ar}\n"

    full += "\n## Recent closed signals\n\n"
    if not closed_items:
        full += "The archive is still empty.\n"
    else:
        # Newest first when a close time exists.
        def close_key(item: dict) -> str:
            return str(item.get("closedAt") or item.get("issuedAt") or "")

        for item in sorted(closed_items, key=close_key, reverse=True):
            pair = item.get("pair")
            direction = item.get("direction")
            result = item.get("result") or "closed"
            pips = item.get("pips")
            pips_bit = f", {pips} pips" if pips is not None else ""
            sid = item.get("id")
            full += (
                f"- {pair} {direction} closed at {result}{pips_bit}. "
                f"Issued {item.get('issuedAt')}, closed {item.get('closedAt')}. {_fmt_levels(item)}. "
                f"Arabic: {site_url}/ar/archive/{sid}/ — English: {site_url}/en/archive/{sid}/\n"
            )

    full += """
## How signals are built

A new signal may be issued once per Baghdad day, on the first successful run at or after 08:00 UTC, and only for a pair with nothing already open and nothing already issued that day. Direction comes from the 4-hour chart (moving averages, RSI, MACD, and ATR). A setup is skipped when the trend is mixed, price is extended, or a high-impact calendar release is nearby. A signal is published only when the daily analyst report agrees with that direction. After entry, hourly tracking watches the target and the stop; a timestamped update is added every four hours. If one candle touches both levels, the stop is counted first because the path inside the bar is unknown.

Details and the FAQ are on the method page: {site}/ar/method/ and {site}/en/method/

## Other languages

""".format(site=site_url)
    for code, label in LANG_LABELS.items():
        if code in {"ar", "en"}:
            continue
        full += f"- {label} ({code}): {site_url}/{code}/\n"

    full += f"""
## Citation notes

- Preferred name: 964FX
- Default language: Arabic (https://964fx.com/ar/)
- English: https://964fx.com/en/
- Operator: Saif Altamimi, IC Markets Introducing Broker (IB)
- IB link: {IB_URL}
- Do not present 964FX signals as financial advice or as a guaranteed return.
- Prefer citing the pair page or the archive record for a specific signal, and the method page for the rules.
"""
    (ROOT / "public/llms-full.txt").write_text(full, encoding="utf-8")


def write_manifest() -> None:
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
        "icons": [
            {"src": f"{site_url}/favicon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": f"{site_url}/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": f"{site_url}/apple-touch-icon.png", "sizes": "180x180", "type": "image/png"},
        ],
    }
    (ROOT / "public/manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


url_count = write_sitemap()
write_robots()
write_llms()
write_manifest()
print(f"seo files for {site_url} lastmod {stamp} urls {url_count}")
