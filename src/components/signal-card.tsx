"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareSignal } from "@/components/share-signal";
import { SignalChart } from "@/components/signal-chart";
import { UpdatesTimeline } from "@/components/updates-timeline";
import { formatPips, formatPrice, formatWhen, pairLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { pickText, textAttrs } from "@/lib/langs";
import type { Signal } from "@/lib/types";

export function SignalCard({ signal, compact = false, href }: { signal: Signal; compact?: boolean; href?: string }) {
  const { t, lang } = useI18n();
  const buy = signal.direction === "BUY";
  const low = Math.min(signal.sl, signal.tp);
  const high = Math.max(signal.sl, signal.tp);
  const span = high - low || 1;
  const mark = Math.min(high, Math.max(low, signal.currentPrice));
  const pct = ((mark - low) / span) * 100;
  const entryPct = ((signal.entry - low) / span) * 100;
  const pips = signal.status === "closed" ? signal.pips : signal.floatingPips;

  const name = pairLabel(signal.pair);
  return (
    <Card className="relative bg-card/80">
      {href ? <Link href={href} className="absolute inset-0 z-[1] rounded-xl" aria-label={name} tabIndex={-1} /> : null}
      <CardHeader className={`relative z-[2] ${href ? "pointer-events-none" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="nums text-xl tracking-tight">
            {href ? (
              <Link href={href} className="pointer-events-auto hover:text-primary">
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <Badge className={buy ? "bg-buy text-buy-foreground" : "bg-sell text-sell-foreground"}>
            {buy ? t.buy : t.sell}
          </Badge>
        </div>
        <p className="nums text-sm text-muted-foreground">
          {t.price} {formatPrice(signal.pair, signal.currentPrice)}
          <span className={pips != null && pips >= 0 ? "ms-2 text-buy" : "ms-2 text-sell"}>
            {formatPips(pips)} {t.pips}
          </span>
        </p>
      </CardHeader>
      <CardContent className={`relative z-[2] space-y-4 ${href ? "pointer-events-none" : ""}`}>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <Level label={t.entry} value={formatPrice(signal.pair, signal.entry)} />
          <Level label={t.sl} value={formatPrice(signal.pair, signal.sl)} />
          <Level label={t.tp} value={formatPrice(signal.pair, signal.tp)} />
        </dl>
        <div dir="ltr">
          <div
            className="relative h-2 rounded-full bg-muted"
            role="img"
            aria-label={`${t.progress}: ${formatPrice(signal.pair, signal.currentPrice)}`}
          >
            <div className="absolute inset-y-0 start-0 rounded-full bg-linear-to-r from-sell/70 to-buy/80" style={{ width: "100%" }} />
            <span className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-foreground/70" style={{ left: `${entryPct}%` }} />
            <span
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatPrice(signal.pair, low)}</span>
            <span>
              {t.rr} 1:{signal.rr.toFixed(2)}
            </span>
            <span>{formatPrice(signal.pair, high)}</span>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {t.issued}: {formatWhen(signal.issuedAt, "Asia/Baghdad", lang)} · {formatWhen(signal.issuedAt, undefined, lang, true)}
          <br />
          {t.quoteTime}: {formatWhen(signal.priceAsOf, "Asia/Baghdad", lang)}
        </p>
        <div className={href ? "pointer-events-auto" : undefined}>
        {signal.status === "closed" ? null : <ShareSignal signal={signal} />}
        {compact ? null : (
          <>
            <SignalChart signal={signal} />
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t.reasons}</h3>
              {t.fallbackNote ? <p className="mb-2 text-xs text-muted-foreground">{t.fallbackNote}</p> : null}
              <ol className="space-y-2">
                {signal.reasons.map((reason, index) => (
                  <li key={reason.en} className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6">
                    <span className="nums me-2 text-primary">{index + 1}</span>
                    <span {...textAttrs(lang)}>{pickText(lang, reason)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.sources}: {signal.sources.join(" · ")}
            </p>
            <UpdatesTimeline updates={signal.updates ?? []} pair={signal.pair} />
          </>
        )}
        </div>
      </CardContent>
    </Card>
  );
}

function Level({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="nums font-medium">{value}</dd>
    </div>
  );
}
