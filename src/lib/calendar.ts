import type { NewsEvent, NewsFile } from "@/lib/types";

const INVERSE = ["unemployment", "jobless", "claimant"];

export const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  NZD: "🇳🇿",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  CNH: "🇨🇳",
  HKD: "🇭🇰",
  SGD: "🇸🇬",
  INR: "🇮🇳",
  KRW: "🇰🇷",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  MXN: "🇲🇽",
  ZAR: "🇿🇦",
  BRL: "🇧🇷",
  TRY: "🇹🇷",
  PLN: "🇵🇱",
  CZK: "🇨🇿",
  HUF: "🇭🇺",
  RUB: "🇷🇺",
  ILS: "🇮🇱",
  SAR: "🇸🇦",
  AED: "🇦🇪",
  QAR: "🇶🇦",
  KWD: "🇰🇼",
  IDR: "🇮🇩",
  THB: "🇹🇭",
  MYR: "🇲🇾",
  PHP: "🇵🇭",
  TWD: "🇹🇼",
};

export function currencyFlag(code: string) {
  return CURRENCY_FLAGS[code] ?? "🏳️";
}

export function parseFigure(value: string): number | null {
  let text = value.trim().replace(/,/g, "").replace(/ /g, "");
  if (!text || ["n/a", "na", "-", "—"].includes(text.toLowerCase())) return null;
  let multiplier = 1;
  const last = text.at(-1);
  if (last === "K" || last === "k") {
    multiplier = 1_000;
    text = text.slice(0, -1);
  } else if (last === "M" || last === "m") {
    multiplier = 1_000_000;
    text = text.slice(0, -1);
  } else if (last === "B" || last === "b") {
    multiplier = 1_000_000_000;
    text = text.slice(0, -1);
  }
  text = text.replace(/%/g, "").replace(/\$/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed * multiplier : null;
}

export type FigureTone = "better" | "worse" | "inline";

export function compareActual(title: string, actual: string, forecast: string): FigureTone | null {
  const actualN = parseFigure(actual);
  const forecastN = parseFigure(forecast);
  if (actualN == null || forecastN == null) return null;
  const inverse = INVERSE.some((word) => title.toLowerCase().includes(word));
  const delta = inverse ? forecastN - actualN : actualN - forecastN;
  const scale = Math.max(Math.abs(forecastN), 1e-9);
  if (Math.abs(delta) / scale < 1e-9 || delta === 0) return "inline";
  return delta > 0 ? "better" : "worse";
}

export function isNewsFile(value: unknown): value is NewsFile {
  if (!value || typeof value !== "object") return false;
  const file = value as NewsFile;
  return Array.isArray(file.events);
}

export function isJustReleased(event: NewsEvent, now: number | null) {
  if (!event.actual || now == null) return false;
  const time = new Date(event.time).getTime();
  return time <= now && now - time <= 3 * 60 * 60 * 1000;
}

export function nextEvent(events: NewsEvent[], now: number | null) {
  if (now == null) return null;
  return events
    .filter((event) => new Date(event.time).getTime() > now && event.impact !== "Holiday")
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0] ?? null;
}
