import Link from "next/link";
import { BookOpen, CalendarDays, LineChart, Send, ShieldAlert } from "lucide-react";
import { BrokerLink } from "@/components/broker-link";
import { GUIDE_SLUGS, GUIDES_REVIEWED, type GuidePack, type GuideSlug } from "@/lib/guides";
import type { Lang } from "@/lib/langs";

const TV_LOCALE: Record<string, string> = {
  ar: "ar_AE",
  en: "en",
  ru: "ru",
  fr: "fr",
  de: "de_DE",
  es: "es",
  pt: "br",
  tr: "tr",
  "zh-cn": "zh_CN",
  "zh-tw": "zh_TW",
};

function InternalLinks({ lang, pack }: { lang: Lang; pack: GuidePack }) {
  const item = "flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm hover:bg-muted";
  return (
    <nav className="grid gap-3 sm:grid-cols-3" aria-label={pack.ui.next}>
      <Link href={`/${lang}/signals/`} className={item}>
        <LineChart className="size-4 shrink-0 text-primary" aria-hidden />
        {pack.ui.signals}
      </Link>
      <Link href={`/${lang}/calendar/`} className={item}>
        <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
        {pack.ui.calendar}
      </Link>
      <a href="https://t.me/Code964fx" target="_blank" rel="noopener" className={item}>
        <Send className="size-4 shrink-0 text-[#229ED9]" aria-hidden />
        <span dir="ltr">{pack.ui.telegram}</span>
      </a>
    </nav>
  );
}

export function GuideNotices({ pack }: { pack: GuidePack }) {
  return (
    <section className="space-y-4 rounded-2xl border border-primary/40 bg-primary/10 p-4 sm:p-5">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldAlert className="size-4" aria-hidden />
          {pack.ui.riskTitle}
        </h2>
        <p className="mt-2 text-sm leading-7">{pack.ui.risk}</p>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-primary">{pack.ui.disclosureTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{pack.ui.disclosure}</p>
      </div>
    </section>
  );
}

export function GuideView({ lang, pack, slug }: { lang: Lang; pack: GuidePack; slug: GuideSlug }) {
  const guide = pack.guides[slug];
  const others = GUIDE_SLUGS.filter((item) => item !== slug);
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <p className="text-sm">
        <Link href={`/${lang}/guides/`} className="text-primary">
          {pack.nav}
        </Link>
      </p>
      <header>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{guide.h1}</h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">{guide.lede}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {pack.ui.updated}: <time dateTime={GUIDES_REVIEWED}>{GUIDES_REVIEWED}</time> · 964FX
        </p>
      </header>

      {slug === "xauusd-gold" ? (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{pack.ui.liveChart}</h2>
          <div className="overflow-hidden rounded-xl border border-border" dir="ltr">
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=240&theme=dark&style=1&hidesidetoolbar=1&symboledit=0&saveimage=0&timezone=Asia%2FBaghdad&locale=${TV_LOCALE[lang] ?? "en"}`}
              title={pack.ui.liveChart}
              loading="lazy"
              className="h-[420px] w-full border-0"
            />
          </div>
          <p className="text-xs text-muted-foreground">{pack.ui.liveChartNote}</p>
        </section>
      ) : null}

      <InternalLinks lang={lang} pack={pack} />

      {guide.sections.map((section) => (
        <section key={section.h} className="space-y-3">
          <h2 className="text-xl font-semibold">{section.h}</h2>
          {section.p.map((text) => (
            <p key={text.slice(0, 40)} className="text-base leading-8">
              {text}
            </p>
          ))}
          {section.list ? (
            <ul className="list-disc space-y-2 ps-6 text-base leading-7">
              {section.list.map((text) => (
                <li key={text.slice(0, 40)}>{text}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{pack.ui.faq}</h2>
        {guide.faq.map((item) => (
          <details key={item.q} className="rounded-xl border border-border bg-card/60 p-4" open>
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{pack.ui.next}</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link href={`/${lang}/method/`} className="text-primary hover:underline">{pack.ui.method}</Link>
          </li>
          {others.map((item) => (
            <li key={item}>
              <Link href={`/${lang}/guides/${item}/`} className="text-primary hover:underline">
                {pack.guides[item].label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <GuideNotices pack={pack} />
      {pack.brokerCta !== false ? (
        <div>
          <BrokerLink variant="outline">IC Markets</BrokerLink>
        </div>
      ) : null}
    </article>
  );
}

export function GuidesIndexView({ lang, pack }: { lang: Lang; pack: GuidePack }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{pack.index.h1}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{pack.index.lede}</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {GUIDE_SLUGS.map((slug) => {
          const guide = pack.guides[slug];
          return (
            <li key={slug}>
              <Link
                href={`/${lang}/guides/${slug}/`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-card/70 p-5 hover:bg-muted"
              >
                <span className="flex items-center gap-2 text-primary">
                  <BookOpen className="size-4" aria-hidden />
                  <span className="text-sm font-semibold">{guide.label}</span>
                </span>
                <span className="text-lg font-semibold leading-snug">{guide.h1}</span>
                <span className="text-sm leading-6 text-muted-foreground">{guide.description}</span>
                <span className="mt-auto text-sm text-primary">{pack.ui.read} →</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <InternalLinks lang={lang} pack={pack} />
      <GuideNotices pack={pack} />
    </div>
  );
}
