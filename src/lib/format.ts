import { LANG_META, type Lang } from "@/lib/langs";

export const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"] as const;

export function pairLabel(pair: string) {
  return `${pair.slice(0, 3)}/${pair.slice(3)}`;
}

export function formatPrice(pair: string, value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const digits = pair.endsWith("JPY") ? 3 : 5;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
  });
}

export function formatPips(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

export function formatPercent(value: number | null) {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function localeFor(lang: Lang) {
  return LANG_META[lang]?.intl ?? "en-GB";
}

export function formatWhen(iso: string, timeZone: string | undefined, lang: Lang, withZone = false) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    numberingSystem: "latn",
    timeZoneName: withZone ? "short" : undefined,
  }).format(date);
}

export function formatClock(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: "Asia/Baghdad",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    numberingSystem: "latn",
  }).format(date);
}

export function baghdadDay(iso: string) {
  return dayKey(iso, "Asia/Baghdad");
}

export const DEFAULT_TZ = "Asia/Baghdad";

export function dayKey(iso: string, timeZone = DEFAULT_TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatDayHeading(iso: string, timeZone: string, lang: Lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    numberingSystem: "latn",
  }).format(date);
}

export function formatTimeShort(iso: string, timeZone: string, lang: Lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    numberingSystem: "latn",
  }).format(date);
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

export function fxMarketClosed(date: Date) {
  const day = date.getUTCDay();
  const hour = date.getUTCHours();
  if (day === 6) return true;
  if (day === 0 && hour < 22) return true;
  if (day === 5 && hour >= 22) return true;
  return false;
}

export function tradeStats(closed: { result?: string; pips?: number }[]) {
  const wins = closed.filter((item) => item.result === "TP").length;
  const losses = closed.filter((item) => item.result === "SL").length;
  const totalPips = closed.reduce((sum, item) => sum + (item.pips ?? 0), 0);
  return {
    wins,
    losses,
    count: closed.length,
    totalPips,
    winRate: closed.length ? wins / closed.length : null,
  };
}
