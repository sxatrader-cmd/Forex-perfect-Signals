"use client";

import Link from "next/link";
import { SignalCard } from "@/components/signal-card";
import { UpdatesTimeline } from "@/components/updates-timeline";
import { formatPips, formatPrice, pairLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { historyData, signalsData } from "@/lib/market-data";
import { pairNames } from "@/lib/seo";

export function PairView({ pair }: { pair: string }) {
  const { t, lang } = useI18n();
  const code = pair.toUpperCase();
  const name = pairNames[code]?.[lang] ?? pairLabel(code);
  const open = signalsData.open.find((signal) => signal.pair === code);
  const scan = signalsData.scan.find((row) => row.pair === code);
  const past = historyData.closed.filter((signal) => signal.pair === code);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <p className="text-sm">
        <Link href={`/${lang}/signals`} className="text-primary">{t.nav.signals}</Link>
      </p>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        <p className="nums mt-2 text-sm text-muted-foreground">{pairLabel(code)}</p>
      </header>
      {open ? <SignalCard signal={open} /> : null}
      {!open && scan ? (
        <article className="rounded-xl border border-border bg-card/70 p-4">
          <h2 className="font-semibold">{t.scanHeading}</h2>
          <p className="mt-2 text-sm leading-7">{lang === "ar" ? scan.summary.ar : scan.summary.en}</p>
          <p className="nums mt-2 text-xs text-muted-foreground">{formatPrice(code, scan.price)} · RSI {scan.rsi4h ?? "—"}</p>
        </article>
      ) : null}
      {!open ? <UpdatesTimeline updates={[]} pair={code} /> : null}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t.archiveTitle}</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.archiveEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {past.map((signal) => (
              <li key={signal.id}>
                <Link href={`/${lang}/archive/${signal.id}`} className="nums text-sm text-primary">
                  {signal.result} · {formatPips(signal.pips)} · {signal.id}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
