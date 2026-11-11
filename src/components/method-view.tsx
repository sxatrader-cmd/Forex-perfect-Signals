"use client";

import { useI18n } from "@/lib/i18n";
import { signalsData } from "@/lib/market-data";
import { BASE_PATH } from "@/lib/site";

export function MethodView() {
  const { t } = useI18n();
  const failed = signalsData.sources.headlines.failed.map((item) => item.source).join(", ");
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <img
          src={`${BASE_PATH}/logo-square.webp`}
          alt="964FX"
          width={759}
          height={800}
          className="mb-6 w-full max-w-[200px]"
        />
        <p className="text-sm font-semibold text-primary">{t.ib}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.methodTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.methodLede}</p>
      </header>
      {t.methodSections.map((section) => (
        <article key={section.title} className="rounded-2xl border border-border bg-card/70 p-5">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
        </article>
      ))}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t.questions}</h2>
        {t.faq.map((item) => (
          <article key={item.q} className="rounded-2xl border border-border bg-card/70 p-5">
            <h3 className="font-semibold">{item.q}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
          </article>
        ))}
      </section>
      <p className="text-xs leading-6 text-muted-foreground">
        {signalsData.sources.prices.detail} {failed ? `${t.failedFeeds}: ${failed}.` : ""}
      </p>
    </div>
  );
}
