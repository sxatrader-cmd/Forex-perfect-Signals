"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrokerLink } from "@/components/broker-link";
import { PartnerBadge } from "@/components/partner-banners";
import { PriceWidget } from "@/components/price-widget";
import { SignalCard } from "@/components/signal-card";
import { Ticker } from "@/components/ticker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatClock, formatPips, formatPrice, fxMarketClosed, pairLabel, tradeStats } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { historyData, signalsData } from "@/lib/market-data";
import { cn } from "@/lib/utils";

export function HomeView() {
  const { t, lang } = useI18n();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const start = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, []);
  const closed = now ? fxMarketClosed(now) : null;
  const stats = tradeStats(historyData.closed);
  const floating = signalsData.open.reduce((sum, signal) => sum + signal.floatingPips, 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="desk-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-primary">{t.ib}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.ibExact}</p>
            <h1 className="mt-5 max-w-xl text-4xl leading-[1.2] font-semibold tracking-tight sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">{t.heroLede}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-foreground">{t.heroRule}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BrokerLink>{t.openAccount}</BrokerLink>
              <Link href={`/${lang}/signals`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-4")}>
                {t.viewSignals}
              </Link>
            </div>
          </div>
          <Card className="bg-card/80 lg:col-span-5">
            <CardHeader>
              <p className="text-xs tracking-wide text-primary uppercase">{t.clockLabel}</p>
              <CardTitle className="nums text-3xl">{now ? formatClock(now, lang) : "—"}</CardTitle>
              <p className="text-sm text-muted-foreground">{closed == null ? "—" : closed ? t.marketClosed : t.marketOpen}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Stat label={t.statsPairs} value="7" />
              <Stat label={t.statsRr} value="1:1.5" />
              <Stat label={t.statsOpen} value={String(signalsData.open.length)} />
            </CardContent>
          </Card>
        </div>
      </section>
      <Ticker />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6">
        <section>
          <Section index="01" title={t.whyTitle} lede={t.whyLede} />
          <div className="grid gap-4 md:grid-cols-2">
            {t.why.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Section index="02" title={t.accountsTitle} lede={t.accountsLede} />
          <div className="grid gap-4 lg:grid-cols-3">
            {t.accounts.map((item) => (
              <Card key={item.name} className="justify-between">
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                  <p>{item.body}</p>
                  <BrokerLink variant="outline" className="w-full">
                    {t.accountsCta}
                  </BrokerLink>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.accountsNote}</p>
        </section>

        <section>
          <Section index="03" title={t.platformsTitle} lede={t.platformsLede} />
          <div className="grid gap-4 md:grid-cols-3">
            {t.platforms.map((item) => (
              <Card key={item.name}>
                <CardHeader>
                  <CardTitle className="wordmark text-2xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <p className="text-xs text-primary">04</p>
              <CardTitle>{t.marketsTitle}</CardTitle>
              <p className="text-sm leading-7 text-muted-foreground">{t.marketsLede}</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {signalsData.scan.map((row) => (
                <Badge key={row.pair} variant="outline" className="nums h-7 px-3">
                  {pairLabel(row.pair)}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.spreadTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">{t.spreadBody}</CardContent>
          </Card>
        </section>

        <section>
          <Section index="05" title={t.previewTitle} lede={signalsData.open.length ? t.heroRule : t.previewEmptyBody} />
          {signalsData.open.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {signalsData.open.map((signal) => (
                <SignalCard key={signal.id} signal={signal} compact />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle>{t.previewEmptyTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {t.previewEmptyBody}
                  <span className="mt-2 block nums">
                    {t.totalPips}: {formatPips(stats.totalPips)} · {t.floating}: {formatPips(floating)}
                  </span>
                </CardContent>
              </Card>
              <div className="grid gap-3 sm:grid-cols-2">
                {signalsData.scan.map((row) => (
                  <article key={row.pair} className="rounded-xl border border-border bg-card/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="nums font-semibold">{pairLabel(row.pair)}</h3>
                      <Badge variant="outline">{t.blocks[row.block ?? ""] ?? row.block}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {lang === "ar" ? row.summary.ar : row.summary.en}
                    </p>
                    <p className="nums mt-2 text-xs text-muted-foreground">
                      {t.scanPrice} {formatPrice(row.pair, row.price)} · {t.rsiShort} {row.rsi4h ?? "—"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
          <Link href={`/${lang}/signals`} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-4 h-11 px-4")}>
            {t.viewSignals}
          </Link>
        </section>

        <section>
          <Section index="06" title={t.stepsTitle} />
          <ol className="grid gap-4 md:grid-cols-4">
            {t.steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-border bg-card/70 p-4">
                <span className="nums text-sm text-primary">0{index + 1}</span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <PriceWidget />
        </section>
        <section className="overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 px-6 py-10 sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">{t.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{t.ctaBody}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <BrokerLink>{t.startTrading}</BrokerLink>
            <PartnerBadge />
          </div>
        </section>
      </div>
    </>
  );
}

function Section({ index, title, lede }: { index: string; title: string; lede?: string }) {
  return (
    <div className="mb-5">
      <p className="nums text-xs text-primary">{index}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {lede ? <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{lede}</p> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-3">
      <p className="nums text-lg font-semibold">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{label}</p>
    </div>
  );
}
