"use client";

import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Disclaimer({ prominent = false }: { prominent?: boolean }) {
  const { t } = useI18n();
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
      <p lang="ar" dir="rtl" className="text-sm leading-7 text-foreground">
        {t.disclaimerAr}
      </p>
      <p lang="en" dir="ltr" className="mt-3 text-sm leading-6 text-muted-foreground">
        {t.disclaimerEn}
      </p>
    </section>
  );
}
