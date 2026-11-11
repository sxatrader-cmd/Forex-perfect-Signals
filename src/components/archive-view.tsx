"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SignalChart } from "@/components/signal-chart";
import { formatPercent, formatPips, formatPrice, formatWhen, pairLabel, tradeStats } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { pickText, textAttrs } from "@/lib/langs";
import { historyData } from "@/lib/market-data";
import { PAIRS } from "@/lib/format";

export function ArchiveView() {
  const { t, lang } = useI18n();
  const [pair, setPair] = useState("All");
  const [result, setResult] = useState("All");
  const [month, setMonth] = useState("All");
  const stats = tradeStats(historyData.closed);
  const avgR = averageR(historyData.closed);
  const months = useMemo(() => {
    const values = new Set(
      historyData.closed.map((signal) => (signal.closedAt ? baghdadMonth(signal.closedAt) : "")).filter(Boolean),
    );
    return Array.from(values).sort().reverse();
  }, []);
  const rows = historyData.closed.filter((signal) => {
    if (pair !== "All" && signal.pair !== pair) return false;
    if (result !== "All" && signal.result !== result) return false;
    if (month !== "All" && baghdadMonth(signal.closedAt || "") !== month) return false;
    return true;
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.archiveTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t.archiveLede}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.statCount} value={String(stats.count)} />
        <Stat label={t.winRate} value={formatPercent(stats.winRate)} />
        <Stat label={t.totalPips} value={formatPips(stats.totalPips)} />
        <Stat label={t.avgR} value={avgR == null ? "—" : avgR.toFixed(2)} />
      </section>
      <div className="flex flex-wrap gap-2">
        <Filter label={t.filterPair} value={pair} onChange={setPair} options={["All", ...PAIRS]} names={{ All: t.all }} />
        <Filter label={t.filterResult} value={result} onChange={setResult} options={["All", "TP", "SL"]} names={{ All: t.all, TP: t.resultTp, SL: t.resultSl }} />
        <Filter label={t.filterMonth} value={month} onChange={setMonth} options={["All", ...months]} names={{ All: t.all }} />
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">{t.archiveEmpty}</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((signal) => (
            <li key={signal.id}>
              <Link href={`/${lang}/archive/${signal.id}`} className="block rounded-xl border border-border bg-card/70 p-4 hover:border-primary/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="nums font-semibold">{pairLabel(signal.pair)} · {signal.direction === "BUY" ? t.buy : t.sell}</span>
                  <span className={signal.pips != null && signal.pips >= 0 ? "nums text-buy" : "nums text-sell"}>
                    {signal.result === "TP" ? t.resultTp : t.resultSl} · {formatPips(signal.pips)}
                  </span>
                </div>
                <p className="nums mt-1 text-xs text-muted-foreground">
                  {signal.closedAt ? formatWhen(signal.closedAt, "Asia/Baghdad", lang) : "—"} · {formatPrice(signal.pair, signal.entry)} → {formatPrice(signal.pair, signal.closePrice)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ArchiveDetail({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const signal = historyData.closed.find((item) => item.id === id);
  if (!signal) return null;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href={`/${lang}/archive`} className="text-primary">{t.archiveTitle}</Link>
      </p>
      <header>
        <h1 className="nums text-3xl font-semibold">{pairLabel(signal.pair)} · {signal.direction}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {signal.result === "TP" ? t.resultTp : t.resultSl} · {formatPips(signal.pips)} {t.pips}
          {signal.durationHours != null ? ` · ${signal.durationHours} ${t.hours}` : ""}
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <Cell label={t.entry} value={formatPrice(signal.pair, signal.entry)} />
        <Cell label={t.sl} value={formatPrice(signal.pair, signal.sl)} />
        <Cell label={t.tp} value={formatPrice(signal.pair, signal.tp)} />
      </dl>
      <SignalChart signal={signal} />
      <ol className="space-y-2">
        {signal.reasons.map((reason, index) => (
          <li key={reason.en} className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6">
            <span className="nums me-2 text-primary">{index + 1}</span>
            <span {...textAttrs(lang)}>{pickText(lang, reason)}</span>
          </li>
        ))}
      </ol>
      <ol className="space-y-2 border-s border-primary/40 ps-3">
        {(signal.updates ?? []).map((update) => (
          <li key={update.at} className="text-sm leading-6">
            <p className="nums text-xs text-primary">{update.baghdad} · {formatPrice(signal.pair, update.price)} · {formatPips(update.floatingPips)}</p>
            <p {...textAttrs(lang)}>{pickText(lang, update.comment)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function averageR(closed: { entry: number; sl: number; pips?: number; pair: string }[]) {
  if (!closed.length) return null;
  const values = closed.map((signal) => {
    const pip = signal.pair.endsWith("JPY") ? 0.01 : 0.0001;
    const risk = Math.abs(signal.entry - signal.sl) / pip;
    if (!risk || signal.pips == null) return 0;
    return signal.pips / risk;
  });
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function baghdadMonth(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baghdad", year: "numeric", month: "2-digit" }).format(new Date(iso));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-border bg-card/80 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="nums mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
  names,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  names: Record<string, string>;
}) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="ms-2 h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground">
        {options.map((option) => (
          <option key={option} value={option}>
            {names[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="nums font-medium">{value}</dd>
    </div>
  );
}
