"use client";

import { useEffect, useRef, useState } from "react";
import type { CandlestickData, IChartApi, ISeriesApi, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts";
import { formatPrice, formatWhen } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { LANG_META } from "@/lib/langs";
import { BASE_PATH } from "@/lib/site";
import type { Signal } from "@/lib/types";

type ChartFile = {
  id: string;
  pair: string;
  direction: "BUY" | "SELL";
  entry: number;
  sl: number;
  tp: number;
  issuedAt: string;
  entryTs: number;
  status: "open" | "closed";
  interval: "15m" | "1h";
  final: boolean;
  updatedAt: string;
  currentPrice?: number;
  result?: "TP" | "SL";
  closePrice?: number;
  closedAt?: string;
  closeTs?: number | null;
  candles: [number, number, number, number, number][];
};

// The repo's raw file updates as soon as Actions commits; the same-origin copy updates on the next deploy.
const RAW_BASE = "https://raw.githubusercontent.com/sxatrader-cmd/Forex-perfect-Signals/main/data/charts";
const POLL_MS = 60_000;
const TICK_MS = 15_000;
// Display candles in Baghdad time (UTC+3, no daylight saving).
const SHIFT = 3 * 3600;
// Kraken lists spot FX for these pairs with CORS open; NZDUSD is not listed and JPY books are thin.
const KRAKEN: Record<string, string> = { EURUSD: "EURUSD", GBPUSD: "GBPUSD", AUDUSD: "AUDUSD", USDCHF: "USDCHF", USDCAD: "USDCAD" };

const COLORS = { up: "#22c55e", down: "#ef4444", entry: "#e5c07b", text: "#a3acb9", grid: "rgba(148,163,184,0.08)" };

async function loadChart(id: string): Promise<ChartFile | null> {
  const bust = Math.floor(Date.now() / 60_000);
  const urls = [`${RAW_BASE}/${id}.json?t=${bust}`, `${BASE_PATH}/data/charts/${id}.json?t=${bust}`];
  let best: ChartFile | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as ChartFile;
      if (!data?.candles?.length) continue;
      if (!best || (data.updatedAt || "") > (best.updatedAt || "")) best = data;
      if (best.final) break;
    } catch {
      // try the next source
    }
  }
  return best;
}

async function loadTick(pair: string): Promise<number | null> {
  const code = KRAKEN[pair];
  if (!code) return null;
  try {
    const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${code}`, { cache: "no-store" });
    const data = await res.json();
    const row = data?.result ? (Object.values(data.result)[0] as { a?: string[]; b?: string[] }) : null;
    const ask = Number(row?.a?.[0]);
    const bid = Number(row?.b?.[0]);
    if (!ask || !bid) return null;
    const spread = Math.abs(ask - bid);
    if (spread > 0.0005) return null;
    return (ask + bid) / 2;
  } catch {
    return null;
  }
}

function toCandles(file: ChartFile): CandlestickData<Time>[] {
  return file.candles.map(([t, o, h, l, c]) => ({ time: (t + SHIFT) as UTCTimestamp, open: o, high: h, low: l, close: c }));
}

export function SignalChart({ signal }: { signal: Signal }) {
  const { lang, t } = useI18n();
  const c = t.chart;
  const rtl = LANG_META[lang].dir === "rtl";
  const box = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<{ setMarkers: (m: SeriesMarker<Time>[]) => void } | null>(null);
  const lastRef = useRef<CandlestickData<Time> | null>(null);
  const fileRef = useRef<ChartFile | null>(null);
  const [file, setFile] = useState<ChartFile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [tick, setTick] = useState<{ price: number; at: Date } | null>(null);

  useEffect(() => {
    let alive = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    let ticker: ReturnType<typeof setInterval> | undefined;
    let observer: ResizeObserver | undefined;

    function apply(next: ChartFile) {
      const series = seriesRef.current;
      if (!series) return;
      const candles = toCandles(next);
      series.setData(candles);
      lastRef.current = candles[candles.length - 1] ?? null;
      const step = next.interval === "1h" ? 3600 : 900;
      const markers: SeriesMarker<Time>[] = [
        {
          time: (next.entryTs + SHIFT) as UTCTimestamp,
          position: next.direction === "BUY" ? "belowBar" : "aboveBar",
          shape: next.direction === "BUY" ? "arrowUp" : "arrowDown",
          color: COLORS.entry,
          text: next.direction === "BUY" ? c.buyEntry : c.sellEntry,
        },
      ];
      if (next.status === "closed") {
        const at = next.closeTs ?? (next.closedAt ? Math.floor(Date.parse(next.closedAt) / 1000 / step) * step : null);
        if (at) {
          const win = next.result === "TP";
          markers.push({
            time: (at + SHIFT) as UTCTimestamp,
            position: "inBar",
            shape: "circle",
            color: win ? COLORS.up : COLORS.down,
            text: win ? c.tpHit : c.slHit,
          });
        }
      }
      markersRef.current?.setMarkers(markers.sort((a, b) => Number(a.time) - Number(b.time)));
      fileRef.current = next;
      setFile(next);
    }

    async function start() {
      const [lib, first] = await Promise.all([import("lightweight-charts"), loadChart(signal.id)]);
      if (!alive || !box.current) return;
      if (!first) {
        setState("missing");
        return;
      }
      const digits = signal.pair.endsWith("JPY") ? 3 : 5;
      const chart = lib.createChart(box.current, {
        autoSize: true,
        layout: { background: { color: "transparent" }, textColor: COLORS.text, fontFamily: "inherit", attributionLogo: true },
        grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
        crosshair: { mode: lib.CrosshairMode.Normal },
        localization: { locale: "en-GB" },
      });
      const series = chart.addSeries(lib.CandlestickSeries, {
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderVisible: false,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
        priceFormat: { type: "price", precision: digits, minMove: 1 / 10 ** digits },
        // Keep entry, SL and TP inside the visible range even when candles have not reached them.
        autoscaleInfoProvider: (original: () => { priceRange: { minValue: number; maxValue: number } | null } | null) => {
          const res = original();
          const levels = [first.entry, first.sl, first.tp];
          const lo = Math.min(...levels);
          const hi = Math.max(...levels);
          if (!res?.priceRange) return { priceRange: { minValue: lo, maxValue: hi } };
          return {
            ...res,
            priceRange: { minValue: Math.min(res.priceRange.minValue, lo), maxValue: Math.max(res.priceRange.maxValue, hi) },
          };
        },
      });
      const line = (price: number, color: string, title: string, style: number) =>
        series.createPriceLine({ price, color, lineWidth: 2, lineStyle: style, axisLabelVisible: true, title });
      line(first.entry, COLORS.entry, c.entry, lib.LineStyle.Solid);
      line(first.sl, COLORS.down, c.sl, lib.LineStyle.Dashed);
      line(first.tp, COLORS.up, c.tp, lib.LineStyle.Dashed);
      chartRef.current = chart;
      seriesRef.current = series;
      markersRef.current = lib.createSeriesMarkers(series, []);
      apply(first);
      chart.timeScale().fitContent();
      setState("ready");
      if (box.current) {
        observer = new ResizeObserver(() => chart.timeScale().fitContent());
        observer.observe(box.current);
        setTimeout(() => observer?.disconnect(), 1500);
      }

      if (first.status === "open" && !first.final) {
        poll = setInterval(async () => {
          const next = await loadChart(signal.id);
          if (!alive || !next) return;
          if ((next.updatedAt || "") > (fileRef.current?.updatedAt || "") || next.final) apply(next);
          if (next.final) {
            clearInterval(poll);
            clearInterval(ticker);
            setTick(null);
          }
        }, POLL_MS);
        const pull = async () => {
          const price = await loadTick(signal.pair);
          const last = lastRef.current;
          const current = fileRef.current;
          if (!alive || price == null || !last || !current || current.final) return;
          if (Math.abs(price - last.close) / last.close > 0.005) return;
          const step = current.interval === "1h" ? 3600 : 900;
          const bucket = (Math.floor(Date.now() / 1000 / step) * step + SHIFT) as UTCTimestamp;
          const bar =
            Number(last.time) === bucket
              ? { ...last, high: Math.max(last.high, price), low: Math.min(last.low, price), close: price }
              : Number(bucket) > Number(last.time)
                ? { time: bucket, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price }
                : null;
          if (!bar) return;
          seriesRef.current?.update(bar);
          lastRef.current = bar;
          setTick({ price, at: new Date() });
        };
        pull();
        ticker = setInterval(pull, TICK_MS);
      }
    }

    start();
    return () => {
      alive = false;
      clearInterval(poll);
      clearInterval(ticker);
      observer?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [signal.id, signal.pair, c]);

  const closed = file?.status === "closed";
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {c.title}
          {file && !closed ? (
            <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-buy/15 px-2 py-0.5 text-[11px] font-medium text-buy">
              <span className="size-1.5 animate-pulse rounded-full bg-buy" />
              {c.live}
            </span>
          ) : null}
          {closed ? (
            <span className={`ms-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${file?.result === "TP" ? "bg-buy/15 text-buy" : "bg-sell/15 text-sell"}`}>
              {c.saved} · {file?.result === "TP" ? c.tpHit : c.slHit}
            </span>
          ) : null}
        </h3>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span><span className="me-1 inline-block h-0.5 w-3 align-middle" style={{ background: COLORS.entry }} />{c.entry}</span>
          <span><span className="me-1 inline-block h-0.5 w-3 align-middle" style={{ background: COLORS.down }} />{c.sl}</span>
          <span><span className="me-1 inline-block h-0.5 w-3 align-middle" style={{ background: COLORS.up }} />{c.tp}</span>
        </div>
      </div>
      <div dir="ltr" className="relative h-72 w-full overflow-hidden rounded-lg border border-border bg-background/40 sm:h-80">
        <div ref={box} className="absolute inset-0" />
        {state !== "ready" ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-muted-foreground" dir={rtl ? "rtl" : "ltr"}>
            {state === "loading" ? c.loading : c.missing}
          </p>
        ) : null}
      </div>
      {file ? (
        <p className="nums text-[11px] leading-5 text-muted-foreground">
          {c.candles} {file.interval} · Yahoo Finance · {c.baghdadTime} · {c.updated} {formatWhen(file.updatedAt, "Asia/Baghdad", lang)}
          {tick ? (
            <>
              <br />
              {c.livePrice} {formatPrice(signal.pair, tick.price)} (Kraken) · {tick.at.toLocaleTimeString(lang === "ar" ? "ar-IQ" : LANG_META[lang].intl, { timeZone: "Asia/Baghdad", hour: "2-digit", minute: "2-digit", second: "2-digit", numberingSystem: "latn" })}
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
