"use client";

import { useEffect, useMemo, useState } from "react";
import { SponsoredGif } from "@/components/partner-banners";
import { Badge } from "@/components/ui/badge";
import { baghdadDay, formatWhen } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { newsData } from "@/lib/market-data";
import type { NewsEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const IMPACTS = ["All", "High", "Medium", "Low", "Holiday"] as const;

export function NewsView() {
  const { t, lang } = useI18n();
  const [impact, setImpact] = useState<(typeof IMPACTS)[number]>("All");
  const [currency, setCurrency] = useState("All");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const start = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, []);

  const currencies = useMemo(() => {
    return Array.from(new Set(newsData.events.map((event) => event.currency))).sort();
  }, []);

  const filtered = newsData.events.filter((event) => {
    if (impact !== "All" && event.impact !== impact) return false;
    if (currency !== "All" && event.currency !== currency) return false;
    return true;
  });

  const just = newsData.events.filter((event) => isJustReleased(event, now));
  const groups = new Map<string, NewsEvent[]>();
  for (const event of filtered) {
    const key = baghdadDay(event.time);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  const impactLabel: Record<string, string> = {
    All: t.filterAll,
    High: t.filterHigh,
    Medium: t.filterMedium,
    Low: t.filterLow,
    Holiday: t.filterHoliday,
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <div className="flex min-w-0 flex-col gap-6">
      <header>
        <p className="text-sm font-semibold text-primary">{t.ib}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.newsTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t.newsLede}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t.updated}: {newsData.updatedAt ? formatWhen(newsData.updatedAt, "Asia/Baghdad", lang) : "—"} · {newsData.sources.forexFactory.events}
        </p>
      </header>
      {newsData.error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{t.newsError}</p>
      ) : null}
      {just.length ? (
        <section aria-label={t.justOut} className="space-y-2">
          <h2 className="text-sm font-semibold text-primary">{t.justOut}</h2>
          <div className="grid gap-2">
            {just.map((event) => (
              <EventRow key={event.id} event={event} fresh now={now} />
            ))}
          </div>
        </section>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.impact}>
          {IMPACTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setImpact(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                impact === item ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
              )}
              aria-pressed={impact === item}
            >
              {impactLabel[item]}
            </button>
          ))}
        </div>
        <label className="text-sm text-muted-foreground">
          <span className="sr-only">{t.currencyAll}</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground"
          >
            <option value="All">{t.currencyAll}</option>
            {currencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">{t.newsEmpty}</p>
      ) : (
        Array.from(groups.entries()).map(([day, events]) => (
          <section key={day} className="space-y-2">
            <h2 className="nums text-sm font-semibold text-primary">{day}</h2>
            <div className="grid gap-2">
              {events.map((event) => (
                <EventRow key={event.id} event={event} fresh={isJustReleased(event, now)} now={now} />
              ))}
            </div>
          </section>
        ))
      )}
      <p className="text-xs leading-6 text-muted-foreground">{t.newsFootnote}</p>
    </div>
    <aside className="flex justify-center lg:justify-start">
      <SponsoredGif />
    </aside>
    </div>
  );
}

function isJustReleased(event: NewsEvent, now: number | null) {
  if (!event.actual || now == null) return false;
  const time = new Date(event.time).getTime();
  return time <= now && now - time <= 3 * 60 * 60 * 1000;
}

function EventRow({ event, fresh, now }: { event: NewsEvent; fresh: boolean; now: number | null }) {
  const { t, lang } = useI18n();
  const upcoming = now != null && new Date(event.time).getTime() > now;
  const actual = event.actual || (upcoming ? t.awaiting : t.noActual);
  return (
    <article className={cn("rounded-xl border border-border bg-card/70 p-3 sm:p-4", fresh && "just-released border-primary/50")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="nums">{event.currency}</Badge>
        <Impact impact={event.impact} />
        {fresh ? <Badge className="bg-primary text-primary-foreground">{t.justOut}</Badge> : null}
        <h3 className="text-sm font-medium">{event.title}</h3>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
        <p>
          <span className="block text-[11px]">{t.timeBaghdad}</span>
          <span className="nums text-foreground">{formatWhen(event.time, "Asia/Baghdad", lang)}</span>
        </p>
        <p>
          <span className="block text-[11px]">{t.timeLocal}</span>
          <span className="nums text-foreground">{formatWhen(event.time, undefined, lang, true)}</span>
        </p>
        <Figure label={t.actual} value={actual} source={event.actualSource} emphasize={Boolean(event.actual)} />
        <Figure label={t.forecast} value={event.forecast || "—"} />
        <Figure label={t.previous} value={event.previous || "—"} />
      </div>
    </article>
  );
}

function Impact({ impact }: { impact: string }) {
  const { t } = useI18n();
  const label =
    impact === "High" ? t.filterHigh : impact === "Medium" ? t.filterMedium : impact === "Low" ? t.filterLow : impact === "Holiday" ? t.filterHoliday : impact;
  const tone =
    impact === "High"
      ? "bg-sell/15 text-sell"
      : impact === "Medium"
        ? "bg-primary/15 text-primary"
        : impact === "Low"
          ? "bg-yellow-500/15 text-yellow-200"
          : "bg-muted text-muted-foreground";
  return <Badge className={tone}>{label}</Badge>;
}

function Figure({ label, value, source, emphasize = false }: { label: string; value: string; source?: string | null; emphasize?: boolean }) {
  return (
    <p>
      <span className="block text-[11px]">{label}</span>
      <span className={cn("nums block", emphasize ? "font-semibold text-foreground" : "text-foreground")} dir="ltr" title={source ?? undefined}>
        {value}
      </span>
      {source ? (
        <span className="block text-[10px] text-muted-foreground" dir="ltr">
          {source}
        </span>
      ) : null}
    </p>
  );
}
