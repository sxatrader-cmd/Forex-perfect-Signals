"use client";

import { useEffect, useState } from "react";
import { newsData } from "@/lib/market-data";
import { formatWhen } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export function Ticker() {
  const { t, lang } = useI18n();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const start = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(start);
  }, []);

  const high = newsData.events.filter((event) => event.impact === "High");
  const windowed =
    now == null
      ? high
      : high.filter((event) => {
          const time = new Date(event.time).getTime();
          return time >= now - 18 * 3600 * 1000 && time <= now + 96 * 3600 * 1000;
        });
  const rows = (windowed.length ? windowed : high).slice(0, 18);

  return (
    <section className="ticker border-y border-border bg-card/50" aria-label={t.ticker}>
      <div className="mx-auto flex w-full max-w-6xl items-stretch">
        <p className="flex shrink-0 items-center border-e border-border bg-primary px-3 text-xs font-semibold text-primary-foreground sm:px-4">
          {t.ticker}
        </p>
        {rows.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">{t.tickerEmpty}</p>
        ) : (
          <div className="overflow-hidden py-2.5" dir="ltr">
            <div className="ticker-track gap-6 pe-6">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex items-center gap-6">
                  {rows.map((event) => (
                    <li key={`${copy}-${event.id}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <span className="size-1.5 rounded-full bg-sell" aria-hidden />
                      <span className="font-semibold text-primary">{event.currency}</span>
                      <span>{event.title}</span>
                      <span className="nums text-muted-foreground">
                        {formatWhen(event.time, "Asia/Baghdad", lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
