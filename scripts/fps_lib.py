"""Shared data and signal logic for Forex Perfect Signal.

Price history comes from the Yahoo Finance chart API (the same source the
yfinance package wraps), with query2 as a fallback host. The economic calendar
list is Forex Factory's public weekly file. That file has no released-actual
field, so actuals are matched from TradingView's public calendar when the
currency and time line up. Headline tone comes from public RSS feeds.
"""

from __future__ import annotations

import json
import math
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

BAGHDAD = timezone(timedelta(hours=3))
USER_AGENT = (
    "ForexPerfectSignal/1.0 "
    "(educational static site; +https://sxatrader-cmd.github.io/Forex-perfect-Signals/)"
)
FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
TV_URL = "https://economic-calendar.tradingview.com/events"

PAIRS = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "AUDUSD",
    "USDCAD",
    "NZDUSD",
]

# A new signal needs every one of these. They are mirrored on the method page.
RSI_BUY = (45.0, 65.0)
RSI_SELL = (35.0, 55.0)
EMA_GAP_ATR = 0.08
EXTENSION_ATR = (0.15, 1.15)
SL_ATR = (0.9, 2.0)
TP_R = 1.7
MIN_R = 1.5
EVENT_BLOCK_HOURS = 8.0
SENTIMENT_BLOCK = 0.6
MIN_HEADLINES = 2
ISSUE_HOUR_UTC = 5

FEEDS = [
    ("ForexLive", "https://www.forexlive.com/feed"),
    ("Investing.com Forex", "https://www.investing.com/rss/news_1.rss"),
    ("Investing.com Economy", "https://www.investing.com/rss/news_14.rss"),
    ("Investing.com Opinion", "https://www.investing.com/rss/forex_Opinion.rss"),
    ("ActionForex", "https://www.actionforex.com/feed/"),
    ("FXStreet", "https://www.fxstreet.com/rss/news"),
]

ALIASES = {
    "USD": ["usd", "dollar", "greenback", "fed", "fomc", "powell", "nfp", "nonfarm", "treasury"],
    "EUR": ["eur", "euro", "ecb", "lagarde"],
    "GBP": ["gbp", "pound", "sterling", "boe", "bailey"],
    "JPY": ["jpy", "yen", "boj", "ueda"],
    "CHF": ["chf", "franc", "snb"],
    "AUD": ["aud", "aussie", "rba"],
    "CAD": ["cad", "loonie", "boc"],
    "NZD": ["nzd", "kiwi", "rbnz"],
}

POSITIVE = {
    "beat", "beats", "hike", "hawkish", "surge", "rally", "gains", "gain",
    "bullish", "strong", "stronger", "rebound", "hotter", "jump", "jumps",
    "rise", "rises", "soars", "soar",
}
NEGATIVE = {
    "miss", "misses", "cut", "cuts", "dovish", "slump", "slumps", "weak",
    "weaker", "bearish", "fall", "falls", "recession", "cooler", "drop",
    "drops", "tumble", "tumbles", "selloff", "slide", "slides",
}
INVERSE_WORDS = ("unemployment", "jobless", "claimant")


class FetchError(RuntimeError):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


@dataclass
class Bar:
    ts: int
    open: float
    high: float
    low: float
    close: float


@dataclass
class Fundamentals:
    sentiment: dict[str, float | None]
    counts: dict[str, int]
    surprises: dict[str, float]
    examples: dict[str, dict]
    next_events: dict[str, dict | None]
    sources: list[str]
    failed: list[dict]
    now: datetime
    headline_examples: dict[str, dict | None] = field(default_factory=dict)


@dataclass
class Decision:
    pair: str
    block: str | None
    summary_en: str
    summary_ar: str
    signal: dict | None = None
    snapshot: dict = field(default_factory=dict)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_z(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_dt(value: str) -> datetime:
    text = value.strip().replace("Z", "+00:00")
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def baghdad_date(dt: datetime) -> str:
    return dt.astimezone(BAGHDAD).date().isoformat()


def pip_size(pair: str) -> float:
    return 0.01 if pair.endswith("JPY") else 0.0001


def price_digits(pair: str) -> int:
    return 3 if pair.endswith("JPY") else 5


def round_px(pair: str, value: float) -> float:
    return float(f"{value:.{price_digits(pair)}f}")


def fmt_px(pair: str, value: float | None) -> str:
    if value is None or not math.isfinite(value):
        return "—"
    return f"{value:.{price_digits(pair)}f}"


def fmt_num(value: float | None, digits: int = 2, signed: bool = False) -> str:
    if value is None or not math.isfinite(value):
        return "n/a"
    spec = f"{{:+.{digits}f}}" if signed else f"{{:.{digits}f}}"
    return spec.format(value)


def fmt_ind(value: float | None) -> str:
    if value is None or not math.isfinite(value):
        return "—"
    absolute = abs(value)
    if absolute >= 1:
        return f"{value:.3f}"
    if absolute >= 0.01:
        return f"{value:.5f}"
    return f"{value:.6f}"


def pips_between(pair: str, distance: float) -> float:
    return distance / pip_size(pair)


def http_get(url: str, headers: dict | None = None, timeout: int = 25, attempts: int = 2) -> bytes:
    base = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, application/rss+xml, application/xml, text/xml, */*",
    }
    if headers:
        base.update(headers)
    last_error: Exception | None = None
    for attempt in range(attempts):
        request = urllib.request.Request(url, headers=base)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            last_error = FetchError(f"HTTP {exc.code} for {url}", status=exc.code)
            if exc.code not in (429, 500, 502, 503, 504) or attempt + 1 == attempts:
                raise last_error from exc
            time.sleep(3)
        except urllib.error.URLError as exc:
            last_error = FetchError(f"network error for {url}: {exc.reason}")
            if attempt + 1 == attempts:
                raise last_error from exc
            time.sleep(2)
    raise last_error or FetchError(f"failed to fetch {url}")


def load_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    path.write_text(text, encoding="utf-8")


def write_if_content_changed(path: Path, payload: dict, volatile: tuple[str, ...] = ("updatedAt",)) -> bool:
    previous = load_json(path)

    def strip(value: dict) -> dict:
        return {key: item for key, item in value.items() if key not in volatile}

    if previous and strip(previous) == strip(payload):
        return False
    payload["updatedAt"] = iso_z(utc_now())
    write_json(path, payload)
    return True


def ema(values: list[float], period: int) -> list[float | None]:
    out: list[float | None] = [None] * len(values)
    if period <= 0 or len(values) < period:
        return out
    seed = sum(values[:period]) / period
    out[period - 1] = seed
    k = 2 / (period + 1)
    prev = seed
    for index in range(period, len(values)):
        prev = values[index] * k + prev * (1 - k)
        out[index] = prev
    return out


def rsi(values: list[float], period: int = 14) -> list[float | None]:
    out: list[float | None] = [None] * len(values)
    if len(values) <= period:
        return out
    gain = 0.0
    loss = 0.0
    for index in range(1, period + 1):
        change = values[index] - values[index - 1]
        gain += max(change, 0.0)
        loss += max(-change, 0.0)
    avg_gain = gain / period
    avg_loss = loss / period

    def reading(avg_g: float, avg_l: float) -> float:
        if avg_l == 0:
            return 100.0
        return 100 - (100 / (1 + avg_g / avg_l))

    out[period] = reading(avg_gain, avg_loss)
    for index in range(period + 1, len(values)):
        change = values[index] - values[index - 1]
        avg_gain = (avg_gain * (period - 1) + max(change, 0.0)) / period
        avg_loss = (avg_loss * (period - 1) + max(-change, 0.0)) / period
        out[index] = reading(avg_gain, avg_loss)
    return out


def atr(bars: list[Bar], period: int = 14) -> list[float | None]:
    true_ranges: list[float] = []
    for index, bar in enumerate(bars):
        if index == 0:
            true_ranges.append(bar.high - bar.low)
        else:
            prev = bars[index - 1].close
            true_ranges.append(max(bar.high - bar.low, abs(bar.high - prev), abs(bar.low - prev)))
    out: list[float | None] = [None] * len(bars)
    if len(true_ranges) < period:
        return out
    prev = sum(true_ranges[:period]) / period
    out[period - 1] = prev
    for index in range(period, len(true_ranges)):
        prev = (prev * (period - 1) + true_ranges[index]) / period
        out[index] = prev
    return out


def macd(values: list[float]) -> tuple[list[float | None], list[float | None], list[float | None]]:
    ema12 = ema(values, 12)
    ema26 = ema(values, 26)
    line: list[float | None] = [None] * len(values)
    valid: list[float] = []
    indexes: list[int] = []
    for index, (fast, slow) in enumerate(zip(ema12, ema26)):
        if fast is None or slow is None:
            continue
        value = fast - slow
        line[index] = value
        valid.append(value)
        indexes.append(index)
    signal_valid = ema(valid, 9)
    signal: list[float | None] = [None] * len(values)
    hist: list[float | None] = [None] * len(values)
    for pos, index in enumerate(indexes):
        if signal_valid[pos] is None or line[index] is None:
            continue
        signal[index] = signal_valid[pos]
        hist[index] = line[index] - signal_valid[pos]
    return line, signal, hist


def last_valid(values: list[float | None]) -> float | None:
    for value in reversed(values):
        if value is not None and math.isfinite(value):
            return value
    return None


def completed(bars: list[Bar], seconds: int, now_ts: int) -> list[Bar]:
    done = [bar for bar in bars if bar.ts + seconds <= now_ts]
    return done or bars


def fetch_yahoo(symbol: str, interval: str, range_: str) -> list[Bar]:
    encoded = urllib.request.quote(symbol, safe="")
    errors: list[str] = []
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        url = f"https://{host}/v8/finance/chart/{encoded}?interval={interval}&range={range_}"
        try:
            payload = json.loads(http_get(url).decode("utf-8"))
        except FetchError as exc:
            errors.append(str(exc))
            continue
        chart = payload.get("chart") or {}
        if chart.get("error"):
            errors.append(str(chart["error"]))
            continue
        result = (chart.get("result") or [None])[0]
        if not result:
            errors.append(f"empty result from {host}")
            continue
        stamps = result.get("timestamp") or []
        quote = (result.get("indicators") or {}).get("quote") or [{}]
        quote = quote[0]
        bars: list[Bar] = []
        opens = quote.get("open") or []
        highs = quote.get("high") or []
        lows = quote.get("low") or []
        closes = quote.get("close") or []
        for index, stamp in enumerate(stamps):
            try:
                o, h, l, c = opens[index], highs[index], lows[index], closes[index]
            except IndexError:
                continue
            if None in (o, h, l, c):
                continue
            bars.append(Bar(int(stamp), float(o), float(h), float(l), float(c)))
        if len(bars) < 10:
            errors.append(f"{host} returned {len(bars)} bars")
            continue
        return bars
    raise FetchError("; ".join(errors) or f"no Yahoo data for {symbol} {interval}")


def fetch_pair_bars(pair: str, now_ts: int) -> dict[str, list[Bar]]:
    symbol = f"{pair}=X"
    daily = completed(fetch_yahoo(symbol, "1d", "2y"), 24 * 3600, now_ts)
    h4 = completed(fetch_yahoo(symbol, "4h", "60d"), 4 * 3600, now_ts)
    h1 = completed(fetch_yahoo(symbol, "1h", "3mo"), 3600, now_ts)
    time.sleep(0.12)
    return {"1d": reconcile_daily(daily, h4), "4h": h4, "1h": h1}


def reconcile_daily(daily: list[Bar], intraday: list[Bar]) -> list[Bar]:
    if not daily or not intraday:
        return daily
    grouped: dict = {}
    for bar in intraday:
        day = datetime.fromtimestamp(bar.ts, timezone.utc).date()
        grouped.setdefault(day, []).append(bar)
    merged: list[Bar] = []
    for bar in daily:
        day = datetime.fromtimestamp(bar.ts, timezone.utc).date()
        chunk = grouped.get(day)
        if not chunk:
            merged.append(bar)
            continue
        merged.append(
            Bar(
                ts=bar.ts,
                open=chunk[0].open,
                high=max(item.high for item in chunk),
                low=min(item.low for item in chunk),
                close=chunk[-1].close,
            )
        )
    return merged


def swings(bars: list[Bar], left: int = 3, right: int = 3, lookback: int = 120) -> tuple[list[float], list[float]]:
    window = bars[-lookback:]
    supports: list[float] = []
    resistances: list[float] = []
    for index in range(left, len(window) - right):
        high = window[index].high
        low = window[index].low
        if all(high > window[pos].high for pos in range(index - left, index)) and all(
            high >= window[pos].high for pos in range(index + 1, index + right + 1)
        ):
            resistances.append(high)
        if all(low < window[pos].low for pos in range(index - left, index)) and all(
            low <= window[pos].low for pos in range(index + 1, index + right + 1)
        ):
            supports.append(low)
    return supports, resistances


def nearest_below(levels: list[float], price: float) -> float | None:
    below = [level for level in levels if level < price]
    return max(below) if below else None


def nearest_above(levels: list[float], price: float) -> float | None:
    above = [level for level in levels if level > price]
    return min(above) if above else None


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def parse_rss(raw: bytes) -> list[dict]:
    text = raw.decode("utf-8", "replace")
    text = re.sub(r"^\s*<\?xml[^>]*>", "", text, count=1)
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        text = re.sub(r"&(?!amp;|lt;|gt;|quot;|apos;|#)", "&amp;", text)
        root = ET.fromstring(text)
    items: list[dict] = []
    for node in root.iter():
        if local_name(node.tag) != "item":
            continue
        title = ""
        link = ""
        for child in list(node):
            name = local_name(child.tag)
            if name == "title" and not title:
                title = "".join(child.itertext()).strip()
            elif name == "link" and not link:
                link = (child.text or "").strip()
        if title:
            items.append({"title": re.sub(r"\s+", " ", title), "link": link})
    return items


def fetch_headlines() -> tuple[list[dict], list[str], list[dict]]:
    items: list[dict] = []
    used: list[str] = []
    failed: list[dict] = []
    seen: set[str] = set()
    for name, url in FEEDS:
        try:
            parsed = parse_rss(http_get(url, timeout=20, attempts=1))
        except FetchError as exc:
            failed.append({"source": name, "error": str(exc)})
            continue
        if not parsed:
            failed.append({"source": name, "error": "no items"})
            continue
        used.append(name)
        for item in parsed[:40]:
            key = re.sub(r"[^a-z0-9]+", " ", item["title"].lower()).strip()
            if not key or key in seen:
                continue
            seen.add(key)
            items.append({**item, "source": name})
    return items, used, failed


def polarity(title: str) -> int:
    words = set(re.findall(r"[a-z0-9']+", title.lower()))
    pos = len(words & POSITIVE)
    neg = len(words & NEGATIVE)
    if pos > neg:
        return 1
    if neg > pos:
        return -1
    return 0


def mentions(title: str, alias: str) -> bool:
    return re.search(rf"\b{re.escape(alias)}\b", title, flags=re.IGNORECASE) is not None


def score_headlines(items: list[dict]) -> tuple[dict[str, float | None], dict[str, int], dict[str, dict | None]]:
    buckets: dict[str, list[int]] = {code: [] for code in ALIASES}
    examples: dict[str, dict | None] = {code: None for code in ALIASES}
    strength: dict[str, int] = {code: 0 for code in ALIASES}
    for item in items:
        direction = polarity(item["title"])
        if direction == 0:
            continue
        hit = [
            code
            for code, aliases in ALIASES.items()
            if any(mentions(item["title"], alias) for alias in aliases)
        ]
        if not hit or len(hit) > 3:
            continue
        for code in hit:
            buckets[code].append(direction)
            if abs(direction) >= strength[code]:
                strength[code] = abs(direction)
                examples[code] = {
                    "title": item["title"][:180],
                    "source": item["source"],
                    "tone": direction,
                }
    sentiment = {
        code: (sum(values) / len(values) if values else None) for code, values in buckets.items()
    }
    counts = {code: len(values) for code, values in buckets.items()}
    return sentiment, counts, examples


def parse_number(value: str | None) -> float | None:
    if value is None:
        return None
    text = str(value).strip().replace(",", "").replace(" ", "")
    if not text or text.lower() in {"n/a", "na", "-"}:
        return None
    multiplier = 1.0
    if text[-1:] in {"K", "k"}:
        multiplier = 1_000.0
        text = text[:-1]
    elif text[-1:] in {"M", "m"}:
        multiplier = 1_000_000.0
        text = text[:-1]
    elif text[-1:] in {"B", "b"}:
        multiplier = 1_000_000_000.0
        text = text[:-1]
    text = text.replace("%", "").replace("$", "")
    try:
        return float(text) * multiplier
    except ValueError:
        return None


def is_inverse(title: str) -> bool:
    lowered = title.lower()
    return any(word in lowered for word in INVERSE_WORDS)


def surprise_fraction(title: str, actual: str, forecast: str) -> float | None:
    actual_n = parse_number(actual)
    forecast_n = parse_number(forecast)
    if actual_n is None or forecast_n is None:
        return None
    delta = (forecast_n - actual_n) if is_inverse(title) else (actual_n - forecast_n)
    base = max(abs(forecast_n), 1e-9)
    return max(-1.0, min(1.0, delta / base))


def format_tv_value(event: dict) -> str:
    actual = event.get("actual")
    if actual is None or actual == "":
        return ""
    if isinstance(actual, float):
        text = f"{actual:.0f}" if abs(actual) >= 100 else f"{actual:g}"
    else:
        text = str(actual)
    scale = event.get("scale") or ""
    if scale:
        text += str(scale)
    if event.get("unit") == "%":
        text += "%"
    return text


def title_tokens(title: str) -> set[str]:
    text = title.lower().replace("non-farm", "nonfarm").replace("non farm", "nonfarm")
    text = text.replace("payrolls", "payroll")
    stop = {
        "m", "y", "q", "mm", "yy", "qq", "sa", "adj", "unadj", "prelim", "flash",
        "final", "the", "of", "and", "mom", "yoy", "qoq", "change", "preliminary",
    }
    return set(re.findall(r"[a-z0-9]+", text)) - stop


def jaccard(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def fetch_tradingview(now: datetime) -> list[dict]:
    start = (now - timedelta(days=6)).date().isoformat()
    end = (now + timedelta(days=8)).date().isoformat()
    countries = "US,EU,GB,JP,AU,CA,NZ,CH,DE,FR,IT,ES,CN"
    url = f"{TV_URL}?from={start}T00:00:00.000Z&to={end}T00:00:00.000Z&countries={countries}"
    raw = http_get(
        url,
        headers={
            "Origin": "https://www.tradingview.com",
            "Referer": "https://www.tradingview.com/",
        },
    )
    payload = json.loads(raw.decode("utf-8"))
    if payload.get("status") != "ok":
        raise FetchError("TradingView calendar did not return status ok")
    events = []
    for item in payload.get("result") or []:
        currency = (item.get("currency") or "").upper()
        if not currency or not item.get("date"):
            continue
        label = f"{item.get('title') or ''} {item.get('indicator') or ''}"
        events.append(
            {
                "currency": currency,
                "dt": parse_dt(item["date"]),
                "tokens": title_tokens(label),
                "title": item.get("title") or item.get("indicator") or "",
                "actual": format_tv_value(item),
            }
        )
    return events


def actual_is_compatible(event: dict, actual: str) -> bool:
    """Reject matches that paste a different indicator onto a speech, vote, or index."""
    title = event["title"].lower()
    if any(word in title for word in ("speak", "statement", "speech", "press", "election", "holiday", "minutes")):
        return False
    forecast = event.get("forecast") or ""
    if "vote" in title and "vote" not in actual.lower():
        return False
    forecast_n = parse_number(forecast)
    actual_n = parse_number(actual)
    if forecast_n is None or actual_n is None:
        return True
    if "%" in forecast and abs(forecast_n) < 20 and abs(actual_n) > max(40.0, abs(forecast_n) * 12):
        return False
    if "-" in forecast and forecast.count("-") >= 2 and "-" not in actual:
        return False
    return True


def match_actual(event: dict, tv_events: list[dict]) -> dict | None:
    if not tv_events:
        return None
    moment = parse_dt(event["time"])
    tokens = title_tokens(event["title"])
    best = None
    best_score = 0.0
    for candidate in tv_events:
        if candidate["currency"] != event["currency"] or not candidate["actual"]:
            continue
        delta = abs((candidate["dt"] - moment).total_seconds())
        if delta > 90 * 60:
            continue
        score = jaccard(tokens, candidate["tokens"]) + max(0.0, 0.2 * (1 - delta / (90 * 60)))
        if score > best_score:
            best_score = score
            best = candidate
    if best is not None and best_score >= 0.45 and actual_is_compatible(event, best["actual"]):
        return best
    return None


def normalize_ff(raw_events: list[dict], tv_events: list[dict] | None) -> tuple[list[dict], int]:
    normalized = []
    matched = 0
    for item in raw_events:
        currency = str(item.get("country") or "").upper()
        title = str(item.get("title") or "").strip()
        if not currency or not title or not item.get("date"):
            continue
        moment = iso_z(parse_dt(str(item["date"])))
        event = {
            "id": f"{currency}|{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')}|{moment}",
            "title": title,
            "currency": currency,
            "time": moment,
            "impact": str(item.get("impact") or "Low"),
            "forecast": str(item.get("forecast") or "").strip(),
            "previous": str(item.get("previous") or "").strip(),
            "actual": str(item.get("actual") or "").strip(),
            "actualSource": "Forex Factory" if str(item.get("actual") or "").strip() else None,
        }
        if not event["actual"] and tv_events:
            found = match_actual(event, tv_events)
            if found:
                event["actual"] = found["actual"]
                event["actualSource"] = "TradingView"
                matched += 1
        normalized.append(event)
    normalized.sort(key=lambda row: (row["time"], row["currency"], row["title"]))
    return normalized, matched


def build_calendar(now: datetime | None = None) -> tuple[list[dict], dict]:
    now = now or utc_now()
    raw = json.loads(http_get(FF_URL).decode("utf-8"))
    if not isinstance(raw, list):
        raise FetchError("Forex Factory file was not a list")
    tv_events: list[dict] = []
    tv_error = None
    try:
        tv_events = fetch_tradingview(now)
    except FetchError as exc:
        tv_error = str(exc)
    events, matched = normalize_ff(raw, tv_events)
    meta = {
        "forexFactory": {"url": FF_URL, "ok": True, "events": len(events)},
        "actuals": {
            "provider": "TradingView",
            "url": TV_URL,
            "ok": tv_error is None,
            "matched": matched,
            "error": tv_error,
        },
    }
    return events, meta


def calendar_fundamentals(events: list[dict], now: datetime) -> tuple[dict[str, float], dict[str, dict], dict[str, dict | None]]:
    surprises = {code: 0.0 for code in ALIASES}
    examples: dict[str, dict] = {}
    best_abs = {code: -1.0 for code in ALIASES}
    upcoming: dict[str, dict | None] = {code: None for code in ALIASES}
    for event in events:
        currency = event["currency"]
        if currency not in surprises:
            continue
        moment = parse_dt(event["time"])
        if moment > now and event["impact"] == "High":
            current = upcoming[currency]
            if current is None or moment < parse_dt(current["time"]):
                upcoming[currency] = event
        if moment > now or event["impact"] not in {"High", "Medium"}:
            continue
        fraction = surprise_fraction(event["title"], event.get("actual") or "", event.get("forecast") or "")
        if fraction is None:
            continue
        surprises[currency] += fraction
        if abs(fraction) > best_abs[currency]:
            best_abs[currency] = abs(fraction)
            examples[currency] = {
                "currency": currency,
                "title": event["title"],
                "actual": event.get("actual") or "",
                "forecast": event.get("forecast") or "",
                "fraction": round(fraction, 2),
            }
    surprises = {code: round(value, 2) for code, value in surprises.items()}
    return surprises, examples, upcoming


def imminent_event(pair: str, upcoming: dict[str, dict | None], now: datetime) -> dict | None:
    base, quote = pair[:3], pair[3:]
    soonest = None
    soonest_hours = None
    for currency in (base, quote):
        event = upcoming.get(currency)
        if not event:
            continue
        hours = (parse_dt(event["time"]) - now).total_seconds() / 3600
        if -0.5 <= hours <= EVENT_BLOCK_HOURS and (soonest_hours is None or hours < soonest_hours):
            soonest = {**event, "hours": hours}
            soonest_hours = hours
    return soonest


def market_closed(now: datetime) -> bool:
    moment = now.astimezone(timezone.utc)
    weekday = moment.weekday()
    if weekday == 5:
        return True
    if weekday == 6 and moment.hour < 22:
        return True
    if weekday == 4 and moment.hour >= 22:
        return True
    return False


def geometry(pair: str, direction: str, entry: float, atr4: float, support: float | None, resistance: float | None) -> tuple[float, float, float]:
    sign = 1 if direction == "BUY" else -1
    protective = support if direction == "BUY" else resistance
    target = resistance if direction == "BUY" else support
    if protective is not None:
        sl = protective - sign * 0.15 * atr4
    else:
        sl = entry - sign * 1.3 * atr4
    risk = (entry - sl) * sign
    if risk < SL_ATR[0] * atr4:
        sl = entry - sign * 1.2 * atr4
    elif risk > SL_ATR[1] * atr4:
        sl = entry - sign * 1.5 * atr4
    risk = (entry - sl) * sign
    tp = entry + sign * TP_R * risk
    if target is not None:
        cap = target - sign * 0.1 * atr4
        reward_cap = (cap - entry) * sign
        if MIN_R * risk <= reward_cap < TP_R * risk:
            tp = cap
    entry_r = round_px(pair, entry)
    sl_r = round_px(pair, sl)
    tp_r = round_px(pair, tp)
    pip = pip_size(pair)
    if direction == "BUY":
        if sl_r >= entry_r:
            sl_r = round_px(pair, entry_r - pip)
        if tp_r <= entry_r:
            tp_r = round_px(pair, entry_r + pip)
    else:
        if sl_r <= entry_r:
            sl_r = round_px(pair, entry_r + pip)
        if tp_r >= entry_r:
            tp_r = round_px(pair, entry_r - pip)
    for _ in range(24):
        risk_r = abs(entry_r - sl_r)
        reward_r = abs(tp_r - entry_r)
        if risk_r > 0 and reward_r + 1e-12 >= MIN_R * risk_r:
            break
        tp_r = round_px(pair, tp_r + (pip if direction == "BUY" else -pip))
    risk_r = abs(entry_r - sl_r)
    return sl_r, tp_r, risk_r


def trend_name(direction: str | None, lang: str) -> str:
    if lang == "ar":
        return {"BUY": "صاعد", "SELL": "هابط"}.get(direction or "", "غير واضح")
    return {"BUY": "bullish", "SELL": "bearish"}.get(direction or "", "mixed")


def build_reasons(pair: str, direction: str, entry: float, sl: float, tp: float, snap: dict, fund: Fundamentals) -> list[dict]:
    base, quote = pair[:3], pair[3:]
    ema20, ema50, ema200 = snap["ema20"], snap["ema50"], snap["ema200"]
    above = "فوق" if ema20 > ema50 else "تحت"
    above2 = "فوق" if ema50 > ema200 else "تحت"
    side = "فوق" if entry > ema20 else "تحت"
    en_above = "above" if ema20 > ema50 else "below"
    en_above2 = "above" if ema50 > ema200 else "below"
    en_side = "above" if entry > ema20 else "below"
    trend = trend_name(direction, "en")
    trend_ar = trend_name(direction, "ar")
    risk_pips = pips_between(pair, abs(entry - sl))
    reward_pips = pips_between(pair, abs(tp - entry))
    rr = reward_pips / risk_pips if risk_pips else 0
    atr_pips = pips_between(pair, snap["atr4"])
    swing = snap["swing"]
    swing_pips = pips_between(pair, abs(entry - swing)) if swing is not None else None
    if direction == "BUY":
        swing_en = f"The nearest 4H swing support is {fmt_px(pair, swing)}, {fmt_num(swing_pips, 1)} pips under the entry. The stop is placed beyond it."
        swing_ar = f"أقرب دعم تأرجح على 4 ساعات عند {fmt_px(pair, swing)}، أي {fmt_num(swing_pips, 1)} نقطة تحت الدخول، ووُضع الإيقاف بعده."
    else:
        swing_en = f"The nearest 4H swing resistance is {fmt_px(pair, swing)}, {fmt_num(swing_pips, 1)} pips above the entry. The stop is placed beyond it."
        swing_ar = f"أقرب مقاومة تأرجح على 4 ساعات عند {fmt_px(pair, swing)}، أي {fmt_num(swing_pips, 1)} نقطة فوق الدخول، ووُضع الإيقاف بعدها."
    if swing is None:
        swing_en = "No nearby 4H swing level fitted inside the ATR stop band, so the stop uses 1.2–1.5 times the 4H ATR instead of a swing."
        swing_ar = "لا يوجد مستوى تأرجح قريب داخل نطاق الإيقاف، لذلك حُسب الإيقاف من 1.2 إلى 1.5 ضعف ATR على 4 ساعات."

    bsent = fund.sentiment.get(base)
    qsent = fund.sentiment.get(quote)
    bcount = fund.counts.get(base, 0)
    qcount = fund.counts.get(quote, 0)
    bsur = fund.surprises.get(base, 0.0)
    qsur = fund.surprises.get(quote, 0.0)
    bex = fund.examples.get(base)
    qex = fund.examples.get(quote)
    example = bex or qex
    if example:
        example_en = (
            f" Largest comparable print: {example.get('currency', base if bex else quote)} "
            f"{example['title']} actual {example['actual']} versus forecast {example['forecast']} "
            f"(signed surprise {fmt_num(example['fraction'], 2, signed=True)})."
        )
        example_ar = (
            f" أكبر مفاجأة قابلة للمقارنة: {example.get('currency', base if bex else quote)} "
            f"{example['title']} الفعلي {example['actual']} مقابل التوقع {example['forecast']} "
            f"(المفاجأة {fmt_num(example['fraction'], 2, signed=True)})."
        )
    else:
        example_en = " No released numeric actual-versus-forecast print was available for these currencies in the weekly file."
        example_ar = " لا توجد قراءة رقمية مكتملة (فعلي مقابل توقع) لعملتي الزوج في ملف هذا الأسبوع."
    next_base = fund.next_events.get(base)
    next_quote = fund.next_events.get(quote)
    next_event = None
    for candidate in (next_base, next_quote):
        if not candidate:
            continue
        if next_event is None or candidate["time"] < next_event["time"]:
            next_event = candidate
    if next_event:
        hours = (parse_dt(next_event["time"]) - fund.now).total_seconds() / 3600
        next_en = f" Next high-impact event: {next_event['currency']} {next_event['title']} in {fmt_num(hours, 1)} hours."
        next_ar = f" أقرب خبر عالي التأثير: {next_event['currency']} {next_event['title']} بعد {fmt_num(hours, 1)} ساعة."
    else:
        next_en = f" No upcoming high-impact event for {base} or {quote} is listed in the current weekly file."
        next_ar = f" لا يوجد خبر عالي التأثير قادم لـ {base} أو {quote} في ملف الأسبوع الحالي."
    sources = ", ".join(fund.sources) if fund.sources else "none"
    cited = fund.headline_examples or {}
    cited_base = cited.get(base)
    cited_quote = cited.get(quote)
    cited_item = cited_base or cited_quote
    if cited_item:
        cite_en = f" Sample headline ({cited_item['source']}): {cited_item['title']}."
        cite_ar = f" عنوان مستخدم ({cited_item['source']}): {cited_item['title']}."
    else:
        cite_en = " No scored headline mentioned either currency."
        cite_ar = " لا يوجد عنوان مُقيَّم يذكر إحدى العملتين."

    low, high = (RSI_BUY if direction == "BUY" else RSI_SELL)
    return [
        {
            "en": (
                f"Daily trend is {trend}: EMA20 at {fmt_px(pair, ema20)} is {en_above} EMA50 at {fmt_px(pair, ema50)}, "
                f"and EMA50 is {en_above2} EMA200 at {fmt_px(pair, ema200)}. Last price {fmt_px(pair, entry)} is {en_side} EMA20."
            ),
            "ar": (
                f"الاتجاه اليومي {trend_ar}: متوسط 20 عند {fmt_px(pair, ema20)} {above} متوسط 50 عند {fmt_px(pair, ema50)}، "
                f"ومتوسط 50 {above2} متوسط 200 عند {fmt_px(pair, ema200)}. آخر سعر {fmt_px(pair, entry)} {side} متوسط 20."
            ),
        },
        {
            "en": (
                f"4H RSI(14) is {fmt_num(snap['rsi4'], 1)}, inside the {direction} band {fmt_num(low, 0)}–{fmt_num(high, 0)}. "
                f"The band excludes overbought and oversold extremes."
            ),
            "ar": (
                f"مؤشر RSI(14) على 4 ساعات يساوي {fmt_num(snap['rsi4'], 1)} داخل نطاق {trend_ar} المعتمد {fmt_num(low, 0)}–{fmt_num(high, 0)}. "
                f"هذا النطاق يستبعد مناطق التشبع."
            ),
        },
        {
            "en": (
                f"4H MACD line is {fmt_ind(snap['macd'])}, signal line {fmt_ind(snap['macdSignal'])}, "
                f"histogram {fmt_ind(snap['macdHist'])}. The histogram agrees with the {trend} direction."
            ),
            "ar": (
                f"خط MACD على 4 ساعات {fmt_ind(snap['macd'])}، وخط الإشارة {fmt_ind(snap['macdSignal'])}، "
                f"والهيستوغرام {fmt_ind(snap['macdHist'])}. إشارة الهيستوغرام توافق الاتجاه {trend_ar}."
            ),
        },
        {"en": swing_en, "ar": swing_ar},
        {
            "en": (
                f"4H ATR(14) is {fmt_px(pair, snap['atr4'])} ({fmt_num(atr_pips, 1)} pips). "
                f"Stop distance {fmt_num(risk_pips, 1)} pips, target distance {fmt_num(reward_pips, 1)} pips, "
                f"reward-to-risk 1:{fmt_num(rr, 2)}. Distances ignore broker spread and slippage."
            ),
            "ar": (
                f"ATR(14) على 4 ساعات يساوي {fmt_px(pair, snap['atr4'])} ({fmt_num(atr_pips, 1)} نقطة). "
                f"مسافة الإيقاف {fmt_num(risk_pips, 1)} نقطة، ومسافة الهدف {fmt_num(reward_pips, 1)} نقطة، "
                f"ونسبة العائد إلى المخاطرة 1:{fmt_num(rr, 2)}. المسافات لا تشمل سبريد الوسيط ولا الانزلاق."
            ),
        },
        {
            "en": (
                f"Headline tone {base} {fmt_num(bsent, 2, signed=True)} from {bcount} scored headlines, "
                f"{quote} {fmt_num(qsent, 2, signed=True)} from {qcount}. "
                f"Weekly surprise sum {base} {fmt_num(bsur, 2, signed=True)}, {quote} {fmt_num(qsur, 2, signed=True)}."
                f"{example_en}{next_en} {cite_en} Sources: {sources}."
            ),
            "ar": (
                f"مزاج العناوين: {base} {fmt_num(bsent, 2, signed=True)} من {bcount} عنواناً مُقيَّماً، "
                f"و{quote} {fmt_num(qsent, 2, signed=True)} من {qcount}. "
                f"مجموع مفاجآت الأسبوع: {base} {fmt_num(bsur, 2, signed=True)}، {quote} {fmt_num(qsur, 2, signed=True)}."
                f"{example_ar}{next_ar} {cite_ar} المصادر: {sources}."
            ),
        },
    ]


def _skip(pair: str, block: str, en: str, ar: str, snapshot: dict) -> Decision:
    return Decision(pair=pair, block=block, summary_en=en, summary_ar=ar, snapshot=snapshot)


def evaluate_pair(
    pair: str,
    daily: list[Bar],
    h4: list[Bar],
    h1: list[Bar],
    fund: Fundamentals,
    now: datetime,
    *,
    market_open: bool | None = None,
) -> Decision:
    snapshot: dict = {"pair": pair}
    if len(daily) < 210 or len(h4) < 220 or not h1:
        return _skip(
            pair,
            "no-data",
            "Not enough completed candles to compute EMA200, RSI, MACD, and ATR.",
            "لا توجد شموع مكتملة كافية لحساب متوسط 200 وRSI وMACD وATR.",
            snapshot,
        )
    price = h1[-1].close
    price_as_of = iso_z(datetime.fromtimestamp(h1[-1].ts + 3600, timezone.utc))
    d_close = [bar.close for bar in daily]
    h_close = [bar.close for bar in h4]
    ema20 = last_valid(ema(d_close, 20))
    ema50 = last_valid(ema(d_close, 50))
    ema200 = last_valid(ema(d_close, 200))
    atr_d = last_valid(atr(daily))
    rsi4 = last_valid(rsi(h_close))
    macd_line, macd_signal, macd_hist = macd(h_close)
    macd_v = last_valid(macd_line)
    signal_v = last_valid(macd_signal)
    hist_v = last_valid(macd_hist)
    ema20_4 = last_valid(ema(h_close, 20))
    ema50_4 = last_valid(ema(h_close, 50))
    atr4 = last_valid(atr(h4))
    supports, resistances = swings(h4)
    support = nearest_below(supports, price)
    resistance = nearest_above(resistances, price)
    snapshot.update(
        {
            "price": round_px(pair, price),
            "priceAsOf": price_as_of,
            "ema20": None if ema20 is None else round_px(pair, ema20),
            "ema50": None if ema50 is None else round_px(pair, ema50),
            "ema200": None if ema200 is None else round_px(pair, ema200),
            "atrDaily": None if atr_d is None else round(atr_d, 6),
            "rsi4h": None if rsi4 is None else round(rsi4, 1),
            "macd4h": None if macd_v is None else round(macd_v, 6),
            "macdSignal4h": None if signal_v is None else round(signal_v, 6),
            "macdHist4h": None if hist_v is None else round(hist_v, 6),
            "ema20_4h": None if ema20_4 is None else round_px(pair, ema20_4),
            "ema50_4h": None if ema50_4 is None else round_px(pair, ema50_4),
            "atr4h": None if atr4 is None else round(atr4, 6),
            "support": None if support is None else round_px(pair, support),
            "resistance": None if resistance is None else round_px(pair, resistance),
        }
    )
    needed = [ema20, ema50, ema200, atr_d, rsi4, macd_v, signal_v, hist_v, ema20_4, ema50_4, atr4]
    if any(value is None or not math.isfinite(value) for value in needed) or atr4 <= 0 or atr_d <= 0:
        return _skip(pair, "no-data", "Indicator math did not return finite values.", "حساب المؤشرات لم يُرجع قيماً صالحة.", snapshot)

    assert ema20 is not None and ema50 is not None and ema200 is not None
    assert atr_d is not None and rsi4 is not None and hist_v is not None
    assert ema20_4 is not None and ema50_4 is not None and atr4 is not None
    if ema20 > ema50 > ema200:
        direction = "BUY"
    elif ema20 < ema50 < ema200:
        direction = "SELL"
    else:
        return _skip(
            pair,
            "no-stack",
            f"Daily EMAs are mixed: EMA20 {fmt_px(pair, ema20)}, EMA50 {fmt_px(pair, ema50)}, EMA200 {fmt_px(pair, ema200)}.",
            f"المتوسطات اليومية غير مصطفة: 20 عند {fmt_px(pair, ema20)}، و50 عند {fmt_px(pair, ema50)}، و200 عند {fmt_px(pair, ema200)}.",
            snapshot,
        )
    snapshot["dailyTrend"] = direction.lower()
    if abs(ema20 - ema50) < EMA_GAP_ATR * atr_d:
        return _skip(
            pair,
            "flat",
            f"Daily EMA20 and EMA50 are only {fmt_px(pair, abs(ema20 - ema50))} apart, under {EMA_GAP_ATR:.2f}× daily ATR {fmt_px(pair, atr_d)}.",
            f"الفرق بين متوسط 20 ومتوسط 50 ضيق ({fmt_px(pair, abs(ema20 - ema50))}) وأقل من {EMA_GAP_ATR:.2f}× ATR اليومي {fmt_px(pair, atr_d)}.",
            snapshot,
        )
    if direction == "BUY" and price <= ema20:
        return _skip(
            pair,
            "price-side",
            f"Bullish stack, but price {fmt_px(pair, price)} is not above daily EMA20 {fmt_px(pair, ema20)}.",
            f"الاصطفاف صاعد، لكن السعر {fmt_px(pair, price)} ليس فوق متوسط 20 اليومي {fmt_px(pair, ema20)}.",
            snapshot,
        )
    if direction == "SELL" and price >= ema20:
        return _skip(
            pair,
            "price-side",
            f"Bearish stack, but price {fmt_px(pair, price)} is not below daily EMA20 {fmt_px(pair, ema20)}.",
            f"الاصطفاف هابط، لكن السعر {fmt_px(pair, price)} ليس تحت متوسط 20 اليومي {fmt_px(pair, ema20)}.",
            snapshot,
        )
    if direction == "BUY" and price <= ema50_4:
        return _skip(
            pair,
            "price-side-4h",
            f"Price {fmt_px(pair, price)} is not above 4H EMA50 {fmt_px(pair, ema50_4)}.",
            f"السعر {fmt_px(pair, price)} ليس فوق متوسط 50 على 4 ساعات {fmt_px(pair, ema50_4)}.",
            snapshot,
        )
    if direction == "SELL" and price >= ema50_4:
        return _skip(
            pair,
            "price-side-4h",
            f"Price {fmt_px(pair, price)} is not below 4H EMA50 {fmt_px(pair, ema50_4)}.",
            f"السعر {fmt_px(pair, price)} ليس تحت متوسط 50 على 4 ساعات {fmt_px(pair, ema50_4)}.",
            snapshot,
        )
    extension = (price - ema20_4) / atr4 if direction == "BUY" else (ema20_4 - price) / atr4
    if extension < EXTENSION_ATR[0] or extension > EXTENSION_ATR[1]:
        return _skip(
            pair,
            "extension",
            f"Distance from 4H EMA20 is {fmt_num(extension, 2)}× ATR; the allowed band is {EXTENSION_ATR[0]:.2f}–{EXTENSION_ATR[1]:.2f}× ATR.",
            f"بعد السعر عن متوسط 20 على 4 ساعات يساوي {fmt_num(extension, 2)}× ATR، والنطاق المعتمد {EXTENSION_ATR[0]:.2f}–{EXTENSION_ATR[1]:.2f}× ATR.",
            snapshot,
        )
    low, high = RSI_BUY if direction == "BUY" else RSI_SELL
    if not (low <= rsi4 <= high):
        return _skip(
            pair,
            "rsi",
            f"4H RSI is {fmt_num(rsi4, 1)}, outside the {direction} band {low:.0f}–{high:.0f}.",
            f"RSI على 4 ساعات يساوي {fmt_num(rsi4, 1)} خارج نطاق {trend_name(direction, 'ar')} {low:.0f}–{high:.0f}.",
            snapshot,
        )
    if direction == "BUY" and hist_v <= 0:
        return _skip(
            pair,
            "macd",
            f"4H MACD histogram is {fmt_ind(hist_v)}, not positive.",
            f"هيستوغرام MACD على 4 ساعات يساوي {fmt_ind(hist_v)} وليس موجباً.",
            snapshot,
        )
    if direction == "SELL" and hist_v >= 0:
        return _skip(
            pair,
            "macd",
            f"4H MACD histogram is {fmt_ind(hist_v)}, not negative.",
            f"هيستوغرام MACD على 4 ساعات يساوي {fmt_ind(hist_v)} وليس سالباً.",
            snapshot,
        )
    entry = round_px(pair, price)
    swing = support if direction == "BUY" else resistance
    sl, tp, risk = geometry(pair, direction, entry, atr4, support, resistance)
    reward = abs(tp - entry)
    if risk <= 0 or reward < MIN_R * risk - 1e-9:
        return _skip(pair, "geometry", "Stop and target could not keep a 1:1.5 reward-to-risk after rounding.", "تعذر تثبيت نسبة 1:1.5 بعد تقريب السعر.", snapshot)
    if pips_between(pair, risk) < 8:
        return _skip(
            pair,
            "geometry",
            f"Stop distance is only {fmt_num(pips_between(pair, risk), 1)} pips, inside the spread noise.",
            f"مسافة الإيقاف {fmt_num(pips_between(pair, risk), 1)} نقطة فقط، أي داخل ضجيج السبريد.",
            snapshot,
        )
    soon = imminent_event(pair, fund.next_events, now)
    if soon:
        return _skip(
            pair,
            "event-risk",
            f"High-impact {soon['currency']} {soon['title']} is {fmt_num(soon['hours'], 1)} hours away. No new signal inside {EVENT_BLOCK_HOURS:.0f} hours of a high-impact release.",
            f"خبر عالي التأثير {soon['currency']} {soon['title']} بعد {fmt_num(soon['hours'], 1)} ساعة. لا تُفتح إشارة خلال {EVENT_BLOCK_HOURS:.0f} ساعات من خبر عالي التأثير.",
            snapshot,
        )
    base, quote = pair[:3], pair[3:]
    base_s = fund.sentiment.get(base)
    quote_s = fund.sentiment.get(quote)
    if (
        base_s is not None
        and quote_s is not None
        and fund.counts.get(base, 0) >= MIN_HEADLINES
        and fund.counts.get(quote, 0) >= MIN_HEADLINES
    ):
        edge = base_s - quote_s
        if direction == "BUY" and edge <= -SENTIMENT_BLOCK:
            return _skip(
                pair,
                "sentiment",
                f"Headline tone opposes a buy: {base} {fmt_num(base_s, 2, True)} versus {quote} {fmt_num(quote_s, 2, True)}.",
                f"مزاج العناوين يعاكس الشراء: {base} {fmt_num(base_s, 2, True)} مقابل {quote} {fmt_num(quote_s, 2, True)}.",
                snapshot,
            )
        if direction == "SELL" and edge >= SENTIMENT_BLOCK:
            return _skip(
                pair,
                "sentiment",
                f"Headline tone opposes a sell: {base} {fmt_num(base_s, 2, True)} versus {quote} {fmt_num(quote_s, 2, True)}.",
                f"مزاج العناوين يعاكس البيع: {base} {fmt_num(base_s, 2, True)} مقابل {quote} {fmt_num(quote_s, 2, True)}.",
                snapshot,
            )
    closed = market_closed(now) if market_open is None else not market_open
    if closed:
        return _skip(
            pair,
            "market-closed",
            f"Technical checks pass for a {direction} at {fmt_px(pair, entry)}, but spot FX is closed. No signal is recorded until the next daily run while prices are live.",
            f"الشروط الفنية مكتملة لاتجاه { 'شراء' if direction == 'BUY' else 'بيع' } عند {fmt_px(pair, entry)}، لكن سوق الفوركس مغلق. لا تُسجَّل إشارة حتى تشغيل يومي والسوق مفتوح.",
            snapshot,
        )
    snap = {
        "ema20": ema20,
        "ema50": ema50,
        "ema200": ema200,
        "rsi4": rsi4,
        "macd": macd_v,
        "macdSignal": signal_v,
        "macdHist": hist_v,
        "atr4": atr4,
        "swing": swing,
    }
    # Attach currency onto surprise examples for the sentence.
    for code, example in list(fund.examples.items()):
        if example and "currency" not in example:
            example["currency"] = code
    reasons = build_reasons(pair, direction, entry, sl, tp, snap, fund)
    if len(reasons) != 6:
        return _skip(pair, "reasons", "Reason builder did not return six reasons.", "تعذر بناء ستة أسباب.", snapshot)
    signal = {
        "id": f"{pair}-{baghdad_date(now).replace('-', '')}-{direction}",
        "pair": pair,
        "direction": direction,
        "entry": entry,
        "sl": sl,
        "tp": tp,
        "rr": round(reward / risk, 2),
        "atr": round(atr4, 6),
        "issuedAt": iso_z(now),
        "priceAsOf": price_as_of,
        "status": "open",
        "currentPrice": entry,
        "floatingPips": 0.0,
        "reasons": reasons,
        "sources": list(fund.sources),
        "indicators": {
            "ema20": snapshot["ema20"],
            "ema50": snapshot["ema50"],
            "ema200": snapshot["ema200"],
            "rsi4h": snapshot["rsi4h"],
            "macd4h": snapshot["macd4h"],
            "macdSignal4h": snapshot["macdSignal4h"],
            "macdHist4h": snapshot["macdHist4h"],
            "atr4h": snapshot["atr4h"],
            "atrDaily": snapshot["atrDaily"],
            "swing": None if swing is None else round_px(pair, swing),
        },
    }
    decision = Decision(
        pair=pair,
        block=None,
        summary_en=f"New {direction} signal at {fmt_px(pair, entry)}, stop {fmt_px(pair, sl)}, target {fmt_px(pair, tp)}.",
        summary_ar=f"إشارة { 'شراء' if direction == 'BUY' else 'بيع' } جديدة عند {fmt_px(pair, entry)}، الإيقاف {fmt_px(pair, sl)}، الهدف {fmt_px(pair, tp)}.",
        signal=signal,
        snapshot=snapshot,
    )
    return decision


def floating_pips(pair: str, direction: str, entry: float, price: float) -> float:
    sign = 1 if direction == "BUY" else -1
    return round((price - entry) * sign / pip_size(pair), 1)


def resolve_exit(direction: str, entry_ready_ts: int, sl: float, tp: float, bars: list[Bar], interval: int = 3600) -> tuple[str, float, str] | None:
    for bar in bars:
        if bar.ts < entry_ready_ts:
            continue
        if direction == "BUY":
            hit_sl = bar.low <= sl
            hit_tp = bar.high >= tp
        else:
            hit_sl = bar.high >= sl
            hit_tp = bar.low <= tp
        if hit_sl or hit_tp:
            # Same candle: the path is unknown, so the stop is assumed first.
            if hit_sl:
                close_price = sl
                result = "SL"
            else:
                close_price = tp
                result = "TP"
            closed_at = iso_z(datetime.fromtimestamp(bar.ts + interval, timezone.utc))
            return result, close_price, closed_at
    return None


def scan_row(decision: Decision) -> dict:
    snap = decision.snapshot
    trend = snap.get("dailyTrend")
    if trend not in {"buy", "sell"}:
        if decision.block == "no-stack":
            trend = "mixed"
        elif trend is None:
            trend = "unknown"
    return {
        "pair": decision.pair,
        "decision": "signal" if decision.signal else "skip",
        "block": decision.block,
        "summary": {"en": decision.summary_en, "ar": decision.summary_ar},
        "price": snap.get("price"),
        "priceAsOf": snap.get("priceAsOf"),
        "dailyTrend": trend,
        "ema20": snap.get("ema20"),
        "ema50": snap.get("ema50"),
        "ema200": snap.get("ema200"),
        "rsi4h": snap.get("rsi4h"),
        "macdHist4h": snap.get("macdHist4h"),
        "atr4h": snap.get("atr4h"),
    }


def empty_fundamentals(now: datetime, sources: list[str] | None = None) -> Fundamentals:
    fund = Fundamentals(
        sentiment={code: None for code in ALIASES},
        counts={code: 0 for code in ALIASES},
        surprises={code: 0.0 for code in ALIASES},
        examples={},
        next_events={code: None for code in ALIASES},
        sources=sources or ["Yahoo Finance"],
        failed=[],
        now=now,
    )
    return fund


def load_events_from_disk() -> list[dict]:
    payload = load_json(DATA / "news.json") or {}
    events = payload.get("events")
    return events if isinstance(events, list) else []


def issuance_block(pair: str, open_signals: list[dict], history: list[dict], now: datetime) -> str | None:
    """One open signal per pair, and at most one new signal per Baghdad day."""
    for signal in open_signals:
        if signal.get("pair") == pair and signal.get("status", "open") == "open":
            return "open"
    today = baghdad_date(now)
    for signal in [*open_signals, *history]:
        if signal.get("pair") != pair or not signal.get("issuedAt"):
            continue
        if baghdad_date(parse_dt(signal["issuedAt"])) == today:
            return "already-today"
    return None
