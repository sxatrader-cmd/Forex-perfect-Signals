"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  compareActual,
  currencyFlag,
  isJustReleased,
  isNewsFile,
  nextEvent,
  type FigureTone,
} from "@/lib/calendar";
import {
  DEFAULT_TZ,
  dayKey,
  detectTimeZone,
  formatCountdown,
  formatDayHeading,
  formatTimeShort,
  formatWhen,
} from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { newsData } from "@/lib/market-data";
import type { NewsEvent, NewsFile } from "@/lib/types";
import { cn } from "@/lib/utils";

const IMPACTS = ["All", "High", "Medium", "Holiday"] as const;
const dropLow = (f: NewsFile): NewsFile => ({ ...f, events: f.events.filter((e) => e.impact !== "Low") });
const REFRESH_MS = 60_000;
const FAST_REFRESH_MS = 15_000;

function newsUrl() {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  return `${base}/news.json`;
}

export function NewsView() {
  const { t, lang } = useI18n();
  const [impact, setImpact] = useState<(typeof IMPACTS)[number]>("All");
  const [currency, setCurrency] = useState("All");
  const [now, setNow] = useState<number | null>(null);
  const [timeZone, setTimeZone] = useState(DEFAULT_TZ);
  const [live, setLive] = useState<NewsFile>(() => dropLow(newsData));
  const eventsRef = useRef(dropLow(newsData).events);
  eventsRef.current = live.events;

  useEffect(() => {
    setTimeZone(detectTimeZone());
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const load = async () => {
      try {
        const response = await fetch(`${newsUrl()}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (!cancelled && isNewsFile(payload)) setLive(dropLow(payload));
      } catch {
        // Keep the last good payload, including the copy baked in at build time.
      }
    };
    const nearRelease = (events: NewsEvent[]) => {
      const stamp = Date.now();
      return events.some((event) => {
        if (event.impact === "Holiday") return false;
        const delta = new Date(event.time).getTime() - stamp;
        return delta > -15 * 60_000 && delta < 2 * 60_000;
      });
    };
    const schedule = (events: NewsEvent[]) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void load().then(() => {
          if (!cancelled) schedule(eventsRef.current);
        });
      }, nearRelease(events) ? FAST_REFRESH_MS : REFRESH_MS);
    };
    void load().then(() => {
      if (!cancelled) schedule(eventsRef.current);
    });
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const currencies = useMemo(() => {
    return Array.from(new Set(live.events.map((event) => event.currency))).sort();
  }, [live.events]);

  const filtered = live.events.filter((event) => {
    if (impact !== "All" && event.impact !== impact) return false;
    if (currency !== "All" && event.currency !== currency) return false;
    return true;
  });

  const upcoming = nextEvent(filtered, now);
  const just = live.events.filter((event) => isJustReleased(event, now));
  const groups = new Map<string, NewsEvent[]>();
  for (const event of filtered) {
    const key = dayKey(event.time, timeZone);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  const todayKey = now != null ? dayKey(new Date(now).toISOString(), timeZone) : null;
  const tomorrowKey =
    now != null ? dayKey(new Date(now + 24 * 60 * 60 * 1000).toISOString(), timeZone) : null;

  const impactLabel: Record<string, string> = {
    All: t.filterAll,
    High: t.filterHigh,
    Medium: t.filterMedium,
    Low: t.filterLow,
    Holiday: t.filterHoliday,
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-primary">{t.ib}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.newsTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t.newsLede}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.updated}: {live.updatedAt ? formatWhen(live.updatedAt, timeZone, lang, true) : "—"} · {live.sources.forexFactory.events} · {t.timezoneShowing}{" "}
            <span dir="ltr">{timeZone}</span>
          </p>
        </header>
        {live.error ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{t.newsError}</p>
        ) : null}
        {upcoming ? (
          <NextEventCard event={upcoming} now={now} timeZone={timeZone} />
        ) : null}
        {just.length ? (
          <section aria-label={t.justOut} className="space-y-2">
            <h2 className="text-sm font-semibold text-primary">{t.justOut}</h2>
            <div className="grid gap-2 md:hidden">
              {just.map((event) => (
                <EventCard key={`just-${event.id}`} event={event} fresh now={now} timeZone={timeZone} next={false} />
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
                  {currencyFlag(code)} {code}
                </option>
              ))}
            </select>
          </label>
        </div>
        {groups.size > 1 ? (
          <nav className="flex flex-wrap gap-2" aria-label={t.newsTitle}>
            {Array.from(groups.entries()).map(([day, events]) => {
              const label =
                day === todayKey ? t.today : day === tomorrowKey ? t.tomorrow : formatDayHeading(events[0].time, timeZone, lang);
              return (
                <a
                  key={day}
                  href={`#day-${day}`}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground",
                    day === todayKey && "border-primary text-primary",
                  )}
                >
                  {label}
                  <span className="nums ms-1 opacity-70">{events.length}</span>
                </a>
              );
            })}
          </nav>
        ) : null}
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">{t.newsEmpty}</p>
        ) : (
          Array.from(groups.entries()).map(([day, events]) => {
            const heading =
              day === todayKey ? t.today : day === tomorrowKey ? t.tomorrow : null;
            return (
              <section key={day} id={`day-${day}`} className="space-y-2 scroll-mt-24">
                <h2 className="nums text-sm font-semibold text-primary">
                  {heading ? `${heading} · ` : null}
                  {formatDayHeading(events[0].time, timeZone, lang)}
                </h2>
                <div className="grid gap-2 md:hidden">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      fresh={isJustReleased(event, now)}
                      now={now}
                      timeZone={timeZone}
                      next={upcoming?.id === event.id}
                    />
                  ))}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                  <table className="w-full min-w-[40rem] border-collapse text-sm">
                    <thead className="bg-muted/40 text-xs text-muted-foreground">
                      <tr className="text-start">
                        <th className="px-3 py-2 font-medium">{t.timeLocal}</th>
                        <th className="px-3 py-2 font-medium">{t.event}</th>
                        <th className="px-3 py-2 font-medium">{t.impact}</th>
                        <th className="px-3 py-2 font-medium">{t.actual}</th>
                        <th className="px-3 py-2 font-medium">{t.forecast}</th>
                        <th className="px-3 py-2 font-medium">{t.previous}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          fresh={isJustReleased(event, now)}
                          now={now}
                          timeZone={timeZone}
                          next={upcoming?.id === event.id}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )}
        <p className="text-xs leading-6 text-muted-foreground">{t.newsFootnote}</p>
      </div>
    </div>
  );
}

function NextEventCard({ event, now, timeZone }: { event: NewsEvent; now: number | null; timeZone: string }) {
  const { t, lang } = useI18n();
  const remain = now == null ? 0 : new Date(event.time).getTime() - now;
  const due = remain <= 0;
  return (
    <section className="rounded-xl border border-primary/50 bg-primary/10 p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.nextEvent}</p>
        <p className="nums text-sm font-semibold text-primary">
          {due ? t.dueNow : `${t.countdownPrefix} ${formatCountdown(remain)}`}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span dir="ltr" aria-hidden className="text-lg leading-none">
          {currencyFlag(event.currency)}
        </span>
        <Badge variant="outline" className="nums">
          {event.currency}
        </Badge>
        <Impact impact={event.impact} />
        <h2 className="text-sm font-medium">{event.title}</h2>
      </div>
      <p className="mt-2 nums text-xs text-muted-foreground">
        {formatTimeShort(event.time, timeZone, lang)} · {formatWhen(event.time, "Asia/Baghdad", lang)} ({t.timeBaghdad})
      </p>
    </section>
  );
}

function EventCard({
  event,
  fresh,
  now,
  timeZone,
  next,
}: {
  event: NewsEvent;
  fresh: boolean;
  now: number | null;
  timeZone: string;
  next: boolean;
}) {
  const { t, lang } = useI18n();
  const upcoming = now != null && new Date(event.time).getTime() > now;
  const actual = event.actual || (upcoming ? t.awaiting : t.noActual);
  const remain = now == null ? 0 : new Date(event.time).getTime() - now;
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card/70 p-3 sm:p-4",
        fresh && "just-released border-primary/50",
        next && "border-primary/60 bg-primary/5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span dir="ltr" aria-hidden className="text-lg leading-none">
          {currencyFlag(event.currency)}
        </span>
        <Badge variant="outline" className="nums">
          {event.currency}
        </Badge>
        <Impact impact={event.impact} />
        {fresh ? <Badge className="bg-primary text-primary-foreground">{t.justOut}</Badge> : null}
        {next ? (
          <Badge className="bg-primary text-primary-foreground">
            {remain <= 0 ? t.dueNow : `${t.countdownPrefix} ${formatCountdown(remain)}`}
          </Badge>
        ) : null}
        <h3 className="text-sm font-medium">{event.title}</h3>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground grid-cols-2 sm:grid-cols-3">
        <p>
          <span className="block text-[11px]">{t.timeLocal}</span>
          <span className="nums text-foreground">{formatTimeShort(event.time, timeZone, lang)}</span>
        </p>
        <p>
          <span className="block text-[11px]">{t.timeBaghdad}</span>
          <span className="nums text-foreground">{formatTimeShort(event.time, "Asia/Baghdad", lang)}</span>
        </p>
        <Figure label={t.actual} value={actual} source={event.actualSource} event={event} kind="actual" emphasize={Boolean(event.actual)} />
        <Figure label={t.forecast} value={event.forecast || "—"} event={event} kind="forecast" />
        <Figure label={t.previous} value={event.previous || "—"} event={event} kind="previous" />
      </div>
    </article>
  );
}

function EventRow({
  event,
  fresh,
  now,
  timeZone,
  next,
}: {
  event: NewsEvent;
  fresh: boolean;
  now: number | null;
  timeZone: string;
  next: boolean;
}) {
  const { t, lang } = useI18n();
  const upcoming = now != null && new Date(event.time).getTime() > now;
  const actual = event.actual || (upcoming ? t.awaiting : t.noActual);
  const remain = now == null ? 0 : new Date(event.time).getTime() - now;
  return (
    <tr
      className={cn(
        "border-t border-border/70 align-top",
        fresh && "just-released bg-primary/5",
        next && "bg-primary/10",
      )}
    >
      <td className="px-3 py-2.5 whitespace-nowrap">
        <p className="nums font-medium text-foreground">{formatTimeShort(event.time, timeZone, lang)}</p>
        <p className="nums text-[11px] text-muted-foreground">
          {formatTimeShort(event.time, "Asia/Baghdad", lang)} {t.timeBaghdad}
        </p>
        {next ? (
          <p className="nums mt-1 text-[11px] font-semibold text-primary">
            {remain <= 0 ? t.dueNow : `${t.countdownPrefix} ${formatCountdown(remain)}`}
          </p>
        ) : null}
        {fresh ? <p className="mt-1 text-[11px] font-semibold text-primary">{t.justOut}</p> : null}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span dir="ltr" aria-hidden>
            {currencyFlag(event.currency)}
          </span>
          <span className="nums text-xs text-muted-foreground">{event.currency}</span>
          <span className="font-medium">{event.title}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <Impact impact={event.impact} />
      </td>
      <td className="px-3 py-2.5">
        <Figure label="" value={actual} source={event.actualSource} event={event} kind="actual" emphasize={Boolean(event.actual)} />
      </td>
      <td className="px-3 py-2.5">
        <Figure label="" value={event.forecast || "—"} event={event} kind="forecast" />
      </td>
      <td className="px-3 py-2.5">
        <Figure label="" value={event.previous || "—"} event={event} kind="previous" />
      </td>
    </tr>
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

function toneClass(tone: FigureTone | null, emphasize: boolean) {
  if (tone === "better") return "nums font-semibold text-buy";
  if (tone === "worse") return "nums font-semibold text-sell";
  if (emphasize) return "nums font-semibold text-foreground";
  return "nums text-foreground";
}

function Figure({
  label,
  value,
  source,
  event,
  kind,
  emphasize = false,
}: {
  label: string;
  value: string;
  source?: string | null;
  event: NewsEvent;
  kind: "actual" | "forecast" | "previous";
  emphasize?: boolean;
}) {
  const { t } = useI18n();
  const tone = kind === "actual" ? compareActual(event.title, event.actual, event.forecast) : null;
  const title =
    tone === "better" ? t.betterThanForecast : tone === "worse" ? t.worseThanForecast : tone === "inline" ? t.inLineWithForecast : (source ?? undefined);
  return (
    <p>
      {label ? <span className="block text-[11px] text-muted-foreground">{label}</span> : null}
      <span className={cn("block", toneClass(tone, emphasize))} dir="ltr" title={title}>
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
