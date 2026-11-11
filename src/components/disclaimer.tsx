"use client";

import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANG_META } from "@/lib/langs";

export function Disclaimer({ prominent = false }: { prominent?: boolean }) {
  const { t, lang } = useI18n();
  const bilingual = lang === "ar" || lang === "en";
  return (
    <section
      className={
        prominent
          ? "rounded-2xl border border-primary/40 bg-primary/10 p-4 sm:p-5"
          : "rounded-xl border border-border bg-card/60 p-4"
      }
      aria-label={t.disclaimerTitle}
    >
      <div className="mb-3 flex items-center gap-2 text-primary">
        <ShieldAlert className="size-4 shrink-0" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide">{t.disclaimerTitle}</h2>
      </div>
      {bilingual ? (
        <p lang="ar" dir="rtl" className="text-sm leading-7 text-foreground">
          {t.disclaimerAr}
        </p>
      ) : (
        <p lang={LANG_META[lang].tag} dir={LANG_META[lang].dir} className="text-sm leading-7 text-foreground">
          {t.disclaimerLocal}
        </p>
      )}
      <p lang="en" dir="ltr" className="mt-3 text-sm leading-6 text-muted-foreground">
        {t.disclaimerEn}
      </p>
    </section>
  );
}
