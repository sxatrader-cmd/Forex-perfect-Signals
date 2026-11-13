export type Reason = { en: string; ar: string };

export type SignalUpdate = {
  at: string;
  baghdad: string;
  price: number;
  floatingPips: number;
  progressToTp: number;
  distanceToSlPips: number;
  comment: Reason;
};

export type Direction = "BUY" | "SELL";

export type Signal = {
  id: string;
  pair: string;
  direction: Direction;
  entry: number;
  sl: number;
  tp: number;
  rr: number;
  atr: number;
  issuedAt: string;
  priceAsOf: string;
  entryReadyTs?: number;
  status: "open" | "closed";
  currentPrice: number;
  floatingPips: number;
  reasons: Reason[];
  updates?: SignalUpdate[];
  sources: string[];
  priceSource?: "Yahoo Finance" | "Coinbase" | null;
  indicators: {
    ema20: number | null;
    ema50: number | null;
    ema200: number | null;
    rsi4h: number | null;
    macd4h: number | null;
    macdSignal4h: number | null;
    macdHist4h: number | null;
    atr4h: number | null;
    atrDaily: number | null;
    swing: number | null;
  };
  result?: "TP" | "SL";
  pips?: number;
  closePrice?: number;
  closedAt?: string;
  durationHours?: number;
};

export type ScanRow = {
  pair: string;
  decision: "skip" | "signal";
  block: string | null;
  summary: Reason;
  price: number | null;
  priceAsOf: string | null;
  dailyTrend: "buy" | "sell" | "mixed" | "unknown";
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi4h: number | null;
  macdHist4h: number | null;
  atr4h: number | null;
  priceSource?: "Yahoo Finance" | "Coinbase" | null;
};

export type SignalsFile = {
  updatedAt: string;
  lastIssueDate: string | null;
  sources: {
    prices: { provider: string; ok: boolean; detail: string; fallback?: string[] };
    calendar: { provider: string; ok: boolean; detail: string };
    actuals: { provider: string; ok: boolean; detail: string };
    headlines: { used: string[]; failed: { source: string; error: string }[] };
  };
  open: Signal[];
  scan: ScanRow[];
};

export type HistoryFile = {
  updatedAt: string;
  closed: Signal[];
};

export type NewsEvent = {
  id: string;
  title: string;
  currency: string;
  time: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
  actualSource: string | null;
};

export type NewsFile = {
  updatedAt: string;
  error: string | null;
  sources: {
    forexFactory: { url: string; ok: boolean; events: number };
    actuals: { provider: string; url: string; ok: boolean; matched: number; error: string | null };
  };
  events: NewsEvent[];
};
