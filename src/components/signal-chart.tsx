"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { CandlestickData, IChartApi, ISeriesApi, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts";
import { formatPrice, formatWhen } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { LANG_META } from "@/lib/langs";
import { BASE_PATH } from "@/lib/site";
import type { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

type IntervalKey = "15m" | "1h" | "4h" | "1d";

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
  interval: IntervalKey;
  final: boolean;
  updatedAt: string;
  currentPrice?: number;
  result?: "TP" | "SL";
  closePrice?: number;
  closedAt?: string;
  closeTs?: number | null;
  candles: [number, number, number, number, number][];
  timeframes?: Partial<Record<IntervalKey, [number, number, number, number, number][]>>;
};

const RAW_BASE = "https://raw.githubusercontent.com/sxatrader-cmd/Forex-perfect-Signals/main/data/charts";
const POLL_MS = 60_000;
const TICK_MS = 15_000;
// Display candles in Baghdad time (UTC+3, no daylight saving).
const SHIFT = 3 * 3600;
const KRAKEN: Record<string, string> = { EURUSD: "EURUSD", GBPUSD: "GBPUSD", AUDUSD: "AUDUSD", USDCHF: "USDCHF", USDCAD: "USDCAD" };
const COLORS = { up: "#22c55e", down: "#ef4444", entry: "#e5c07b", text: "#a3acb9", grid: "rgba(148,163,184,0.08)" };
const TF_ORDER: IntervalKey[] = ["15m", "1h", "4h", "1d"];
const TF_LABEL: Record<IntervalKey, string> = { "15m": "M15", "1h": "H1", "4h": "H4", "1d": "D1" };
const TF_SECONDS: Record<IntervalKey, number> = { "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400 };

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

function rawCandles(file: ChartFile, tf: IntervalKey): [number, number, number, number, number][] | null {
  const fromTf = file.timeframes?.[tf];
  if (fromTf?.length) return fromTf;
  if (file.interval === tf && file.candles?.length) return file.candles;
  return null;
}

function availableTimeframes(file: ChartFile): IntervalKey[] {
  return TF_ORDER.filter((key) => rawCandles(file, key)?.length);
}

function toCandles(rows: [number, number, number, number, number][]): CandlestickData<Time>[] {
  return rows.map(([t, o, h, l, c]) => ({ time: (t + SHIFT) as UTCTimestamp, open: o, high: h, low: l, close: c }));
}

function containingTime(candles: CandlestickData<Time>[], utcTs: number): UTCTimestamp | null {
  const target = utcTs + SHIFT;
  let best: number | null = null;
  for (const candle of candles) {
    const t = Number(candle.time);
    if (t <= target) best = t;
    else break;
  }
  if (best != null) return best as UTCTimestamp;
  return candles.length ? (candles[0].time as UTCTimestamp) : null;
}

function closeUtc(file: ChartFile): number | null {
  if (file.closeTs) return file.closeTs;
  if (file.closedAt) return Math.floor(Date.parse(file.closedAt) / 1000);
  return null;
}

function issuedUtc(file: ChartFile): number {
  const fromIso = Date.parse(file.issuedAt);
  if (Number.isFinite(fromIso)) return Math.floor(fromIso / 1000);
  return file.entryTs;
}

type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

function fsElement(): Element | null {
  const doc = document as FsDoc;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFs(el: HTMLElement): Promise<boolean> {
  const node = el as FsEl;
  try {
    if (node.requestFullscreen) {
      await node.requestFullscreen();
      return true;
    }
    if (node.webkitRequestFullscreen) {
      await node.webkitRequestFullscreen();
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function exitFsNative(): Promise<void> {
  const doc = document as FsDoc;
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }
    if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    // already left, or the browser blocked the call
  }
}

export function SignalChart({ signal }: { signal: Signal }) {
  const { lang, t } = useI18n();
  const c = t.chart;
  const rtl = LANG_META[lang].dir === "rtl";
  const shell = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<{ setMarkers: (m: SeriesMarker<Time>[]) => void } | null>(null);
  const lastRef = useRef<CandlestickData<Time> | null>(null);
  const fileRef = useRef<ChartFile | null>(null);
  const tfRef = useRef<IntervalKey>("15m");
  const labelsRef = useRef(c);
  const [file, setFile] = useState<ChartFile | null>(null);
  const [tf, setTf] = useState<IntervalKey>("15m");
  const [frames, setFrames] = useState<IntervalKey[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [tick, setTick] = useState<{ price: number; at: Date } | null>(null);
  const [nativeFs, setNativeFs] = useState(false);
  const [cssFs, setCssFs] = useState(false);
  const fullscreen = nativeFs || cssFs;

  labelsRef.current = c;

  const apply = useCallback((next: ChartFile, interval = tfRef.current, fit = false) => {
    const series = seriesRef.current;
    if (!series) return;
    const rows = rawCandles(next, interval);
    if (!rows?.length) return;
    const candles = toCandles(rows);
    series.setData(candles);
    lastRef.current = candles[candles.length - 1] ?? null;
    const labels = labelsRef.current;
    const markers: SeriesMarker<Time>[] = [];
    const entryAt = containingTime(candles, issuedUtc(next));
    if (entryAt != null) {
      markers.push({
        time: entryAt,
        position: next.direction === "BUY" ? "belowBar" : "aboveBar",
        shape: next.direction === "BUY" ? "arrowUp" : "arrowDown",
        color: COLORS.entry,
        text: next.direction === "BUY" ? labels.buyEntry : labels.sellEntry,
      });
    }
    if (next.status === "closed") {
      const at = closeUtc(next);
      const closeAt = at != null ? containingTime(candles, at) : null;
      if (closeAt != null) {
        const win = next.result === "TP";
        markers.push({
          time: closeAt,
          position: "inBar",
          shape: "circle",
          color: win ? COLORS.up : COLORS.down,
          text: win ? labels.tpHit : labels.slHit,
        });
      }
    }
    markersRef.current?.setMarkers(markers.sort((a, b) => Number(a.time) - Number(b.time)));
    fileRef.current = next;
    setFile(next);
    setFrames(availableTimeframes(next));
    if (fit) chartRef.current?.timeScale().fitContent();
  }, []);

  const pickTf = useCallback(
    (next: IntervalKey) => {
      if (tfRef.current === next) return;
      const current = fileRef.current;
      if (!current || !rawCandles(current, next)?.length) return;
      tfRef.current = next;
      setTf(next);
      apply(current, next, true);
    },
    [apply],
  );

  const zoomBy = useCallback((factor: number) => {
    const scale = chartRef.current?.timeScale();
    if (!scale) return;
    const range = scale.getVisibleLogicalRange();
    if (!range) return;
    const mid = (range.from + range.to) / 2;
    const half = ((range.to - range.from) * factor) / 2;
    if (half < 1.5) return;
    scale.setVisibleLogicalRange({ from: mid - half, to: mid + half });
  }, []);

  const fitChart = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const leaveFullscreen = useCallback(async () => {
    setCssFs(false);
    if (fsElement()) await exitFsNative();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      await leaveFullscreen();
      return;
    }
    const el = shell.current;
    if (!el) return;
    const ok = await requestFs(el);
    if (!ok && !fsElement()) setCssFs(true);
  }, [fullscreen, leaveFullscreen]);

  useEffect(() => {
    function onChange() {
      setNativeFs(!!fsElement());
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setCssFs(false);
    }
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (cssFs) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cssFs]);

  useEffect(() => {
    let alive = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    let ticker: ReturnType<typeof setInterval> | undefined;

    async function start() {
      const [lib, first] = await Promise.all([import("lightweight-charts"), loadChart(signal.id)]);
      if (!alive || !box.current) return;
      if (!first) {
        setState("missing");
        return;
      }
      const initialTf = availableTimeframes(first)[0] ?? first.interval;
      tfRef.current = initialTf;
      setTf(initialTf);
      setFrames(availableTimeframes(first));
      const digits = signal.pair.endsWith("JPY") ? 3 : 5;
      const chart = lib.createChart(box.current, {
        autoSize: true,
        layout: { background: { color: "transparent" }, textColor: COLORS.text, fontFamily: "inherit", attributionLogo: true },
        grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
        crosshair: { mode: lib.CrosshairMode.Normal },
        localization: { locale: "en-GB" },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
      });
      const series = chart.addSeries(lib.CandlestickSeries, {
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderVisible: false,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
        priceFormat: { type: "price", precision: digits, minMove: 1 / 10 ** digits },
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
      line(first.entry, COLORS.entry, labelsRef.current.entry, lib.LineStyle.Solid);
      line(first.sl, COLORS.down, labelsRef.current.sl, lib.LineStyle.Dashed);
      line(first.tp, COLORS.up, labelsRef.current.tp, lib.LineStyle.Dashed);
      chartRef.current = chart;
      seriesRef.current = series;
      markersRef.current = lib.createSeriesMarkers(series, []);
      apply(first, initialTf, true);
      setState("ready");

      if (first.status === "open" && !first.final) {
        poll = setInterval(async () => {
          const next = await loadChart(signal.id);
          if (!alive || !next) return;
          if ((next.updatedAt || "") > (fileRef.current?.updatedAt || "") || next.final) apply(next, tfRef.current, false);
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
          const step = TF_SECONDS[tfRef.current];
          const nowUtc = Math.floor(Date.now() / 1000);
          const lastUtc = Number(last.time) - SHIFT;
          if (nowUtc < lastUtc) return;
          const stepsAhead = Math.floor((nowUtc - lastUtc) / step);
          const bar =
            stepsAhead <= 0
              ? { ...last, high: Math.max(last.high, price), low: Math.min(last.low, price), close: price }
              : {
                  time: (lastUtc + stepsAhead * step + SHIFT) as UTCTimestamp,
                  open: last.close,
                  high: Math.max(last.close, price),
                  low: Math.min(last.close, price),
                  close: price,
                };
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
      if (fsElement() && shell.current && fsElement() === shell.current) void exitFsNative();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [signal.id, signal.pair, apply]);

  const closed = file?.status === "closed";
  const toolBtn =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

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
      <div
        ref={shell}
        className={cn(
          "chart-shell relative flex flex-col overflow-hidden rounded-lg border border-border bg-background/40",
          cssFs &&
            "fixed inset-0 z-[100] h-[100dvh] w-screen rounded-none border-0 bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-border/60 px-1.5 py-1">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label={c.timeframe}>
            {TF_ORDER.map((key) => {
              const on = tf === key;
              const enabled = frames.includes(key) || (!frames.length && key === tf);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!enabled || state !== "ready"}
                  onClick={() => pickTf(key)}
                  aria-pressed={on}
                  className={cn(
                    "h-9 min-w-11 rounded-md px-2.5 text-xs font-semibold tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40",
                    on ? "bg-gold/20 text-gold" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {TF_LABEL[key]}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolBtn} onClick={() => zoomBy(0.7)} disabled={state !== "ready"} aria-label={c.zoomIn} title={c.zoomIn}>
              <ZoomIn className="size-4" />
            </button>
            <button type="button" className={toolBtn} onClick={() => zoomBy(1.4)} disabled={state !== "ready"} aria-label={c.zoomOut} title={c.zoomOut}>
              <ZoomOut className="size-4" />
            </button>
            <button type="button" className={cn(toolBtn, "min-w-9 px-2 text-[11px] font-medium")} onClick={fitChart} disabled={state !== "ready"} aria-label={c.fit} title={c.fit}>
              {c.fit}
            </button>
            <button
              type="button"
              className={toolBtn}
              onClick={() => void toggleFullscreen()}
              disabled={state === "loading"}
              aria-label={fullscreen ? c.exitFullscreen : c.fullscreen}
              title={fullscreen ? c.exitFullscreen : c.fullscreen}
              aria-pressed={fullscreen}
            >
              {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>
        </div>
        <div dir="ltr" className={cn("chart-plot relative w-full", cssFs || nativeFs ? "min-h-0 flex-1" : "h-72 sm:h-80")}>
          <div ref={box} className="absolute inset-0" />
          {state !== "ready" ? (
            <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-muted-foreground" dir={rtl ? "rtl" : "ltr"}>
              {state === "loading" ? c.loading : c.missing}
            </p>
          ) : null}
        </div>
      </div>
      {file ? (
        <p className="nums text-[11px] leading-5 text-muted-foreground">
          {c.candles} {TF_LABEL[tf] ?? file.interval} · Yahoo Finance · {c.baghdadTime} · {c.updated} {formatWhen(file.updatedAt, "Asia/Baghdad", lang)}
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
