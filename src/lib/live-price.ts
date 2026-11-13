// Live mid for the signal chart. The page is a static export, so this has to be
// a keyless request the browser can read. A null result leaves the Yahoo candles
// in place.
//
// Kraken stays the source for EURUSD, GBPUSD, AUDUSD, USDCHF, and USDCAD. Those
// books are tight enough for the 0.0005 spread gate, and that request is unchanged.
// Kraken lists no NZD pair, so NZDUSD and GBPNZD have nothing to poll there.
// Its USDJPY, EURJPY, and EURCAD books are too wide to use: on 2026-11-13 USDJPY
// was several yen wide and about 60 pips off the Yahoo mid, and a GBPJPY cross
// built from that leg was about 80 pips off. That error can still slip through
// the chart's 0.5% check, so those crosses are not derived from Kraken.
//
// Every other pair uses Coinbase's public spot price. It needs no key, sends
// Access-Control-Allow-Origin: *, and is documented as current for seconds.
// Against the Yahoo candles it was within a few pips on every pair below.
//
// USDJPY and USDCAD are not issued (NO_ISSUE_PAIRS in scripts/fps_lib.py) but
// still have a source, so a chart on either pair can tick.

type Pair = (typeof import("@/lib/format").PAIRS)[number];

export type LiveTick = {
  price: number;
  source: "Kraken" | "Coinbase";
};

type QuoteSpec = {
  source: LiveTick["source"];
  code: string;
};

const QUOTE = {
  EURUSD: { source: "Kraken", code: "EURUSD" },
  GBPUSD: { source: "Kraken", code: "GBPUSD" },
  AUDUSD: { source: "Kraken", code: "AUDUSD" },
  USDCHF: { source: "Kraken", code: "USDCHF" },
  USDCAD: { source: "Kraken", code: "USDCAD" },
  USDJPY: { source: "Coinbase", code: "USD-JPY" },
  NZDUSD: { source: "Coinbase", code: "NZD-USD" },
  GBPJPY: { source: "Coinbase", code: "GBP-JPY" },
  GBPAUD: { source: "Coinbase", code: "GBP-AUD" },
  GBPCAD: { source: "Coinbase", code: "GBP-CAD" },
  GBPNZD: { source: "Coinbase", code: "GBP-NZD" },
  EURGBP: { source: "Coinbase", code: "EUR-GBP" },
  EURJPY: { source: "Coinbase", code: "EUR-JPY" },
  EURCAD: { source: "Coinbase", code: "EUR-CAD" },
} as const satisfies Record<Pair, QuoteSpec>;

export async function loadTick(pair: string): Promise<LiveTick | null> {
  const spec = (QUOTE as Record<string, QuoteSpec | undefined>)[pair];
  if (!spec) return null;
  const price = spec.source === "Kraken" ? await loadKraken(spec.code) : await loadCoinbase(spec.code);
  if (price == null) return null;
  return { price, source: spec.source };
}

async function loadKraken(code: string): Promise<number | null> {
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

async function loadCoinbase(code: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${code}/spot`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { amount?: string; base?: string; currency?: string } };
    const [base, quote] = code.split("-");
    const row = data?.data;
    if (!row || row.base !== base || row.currency !== quote) return null;
    const price = Number(row.amount);
    if (!Number.isFinite(price) || price <= 0) return null;
    return price;
  } catch {
    return null;
  }
}
