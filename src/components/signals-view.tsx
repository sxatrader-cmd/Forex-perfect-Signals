"use client";

import { Disclaimer } from "@/components/disclaimer";
import { PriceWidget } from "@/components/price-widget";
import { SignalCard } from "@/components/signal-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatPips, formatPrice, formatWhen, pairLabel, tradeStats } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { pickText, textAttrs } from "@/lib/langs";
import { historyData, signalsData } from "@/lib/market-data";

export function SignalsView({ heading }: { heading?: string } = {}) {
  const { t, lang } = useI18n();
  const stats = tradeStats(historyData.closed);
  const floating = signalsData.open.reduce((sum, signal) => sum + signal.floatingPips, 0);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div className="flex min-w-0 flex-col gap-8">
      <header>
        <p className="text-sm font-semibold text-primary">{t.ib}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{heading ?? t.signalsTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t.signalsLede}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t.updated}: {formatWhen(signalsData.updatedAt, "Asia/Baghdad", lang)}
          {signalsData.lastIssueDate ? ` · ${signalsData.lastIssueDate}` : ""}
        </p>
      </header>
      <Disclaimer prominent />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t.winRate} value={formatPercent(stats.winRate)} note={stats.count ? `${stats.wins}/${stats.count}` : t.noClosed} />
        <Metric label={t.totalPips} value={formatPips(stats.totalPips)} note={t.pips} />
        <Metric label={t.closedCount} value={String(stats.count)} note={`${t.resultTp} ${stats.wins} · ${t.resultSl} ${stats.losses}`} />
        <Metric label={t.floating} value={formatPips(floating)} note={`${signalsData.open.length}`} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t.openHeading}</h2>
        {signalsData.open.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {signalsData.open.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm leading-7 text-muted-foreground">
            {t.emptyOpen}
          </p>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t.scanHeading}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {signalsData.scan.map((row) => (
            <article key={row.pair} className="rounded-xl border border-border bg-card/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="nums text-lg font-semibold">{pairLabel(row.pair)}</h3>
                <Badge variant={row.decision === "signal" ? "default" : "outline"}>
                  {t.blocks[row.block ?? ""] ?? row.decision}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6" {...textAttrs(lang)}>{pickText(lang, row.summary)}</p>
              <p className="nums mt-3 text-xs text-muted-foreground">
                {t.trend[row.dailyTrend]} · {formatPrice(row.pair, row.price)} · EMA {formatPrice(row.pair, row.ema20)} / {formatPrice(row.pair, row.ema50)} / {formatPrice(row.pair, row.ema200)} · RSI {row.rsi4h ?? "—"}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t.historyHeading}</h2>
        {historyData.closed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm leading-7 text-muted-foreground">
            {t.emptyHistory}
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.quoteTime}</TableHead>
                    <TableHead>{t.event}</TableHead>
                    <TableHead>{t.buy}</TableHead>
                    <TableHead>{t.entry}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead>{t.resultTp}</TableHead>
                    <TableHead>{t.pips}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.closed.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className="nums">{signal.closedAt ? formatWhen(signal.closedAt, "Asia/Baghdad", lang) : "—"}</TableCell>
                      <TableCell className="nums">{pairLabel(signal.pair)}</TableCell>
                      <TableCell>{signal.direction === "BUY" ? t.buy : t.sell}</TableCell>
                      <TableCell className="nums">{formatPrice(signal.pair, signal.entry)}</TableCell>
                      <TableCell className="nums">{formatPrice(signal.pair, signal.closePrice)}</TableCell>
                      <TableCell>{signal.result === "TP" ? t.resultTp : t.resultSl}</TableCell>
                      <TableCell className={signal.pips != null && signal.pips >= 0 ? "nums text-buy" : "nums text-sell"}>
                        {formatPips(signal.pips)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {historyData.closed.map((signal) => (
                <article key={signal.id} className="rounded-xl border border-border p-4 text-sm">
                  <p className="nums font-semibold">{pairLabel(signal.pair)} · {signal.direction === "BUY" ? t.buy : t.sell}</p>
                  <p className="mt-1 text-muted-foreground">{signal.result === "TP" ? t.resultTp : t.resultSl} · {formatPips(signal.pips)} {t.pips}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <p className="text-xs leading-6 text-muted-foreground">
        {signalsData.sources.prices.detail} {signalsData.sources.actuals.detail}
        {signalsData.sources.headlines.failed.length ? ` ${t.failedFeeds}: ${signalsData.sources.headlines.failed.map((item) => item.source).join(", ")}.` : ""}
      </p>
      <p>
        <a href={`/${lang}/archive`} className="text-sm text-primary underline-offset-4 hover:underline">{t.archiveTitle}</a>
      </p>
    </div>
    <aside className="flex flex-col items-center gap-8">
      <PriceWidget />
    </aside>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl border border-border bg-card/80 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="nums mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
    </article>
  );
}
