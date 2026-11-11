"use client";

import Link from "next/link";
import { BrokerLink } from "@/components/broker-link";
import { Disclaimer } from "@/components/disclaimer";
import { Logo } from "@/components/logo";
import { PartnerBadge } from "@/components/partner-banners";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, lang } = useI18n();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <Disclaimer />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3" dir="ltr">
            <Logo />
            <p className="text-sm font-medium text-primary">{t.partnerBadge}</p>
            <PartnerBadge />
            <p className="text-sm font-medium text-primary">{t.ib}</p>
            <p className="text-sm text-muted-foreground" lang={/[\u0600-\u06FF]/.test(t.ibExact) ? "ar" : "en"}>
              {t.ibExact}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">{t.footerNote}</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <Link href={`/${lang}`} className="hover:text-foreground">{t.nav.home}</Link>
              <Link href={`/${lang}/signals`} className="hover:text-foreground">{t.nav.signals}</Link>
              <Link href={`/${lang}/news`} className="hover:text-foreground">{t.nav.news}</Link>
              <Link href={`/${lang}/archive`} className="hover:text-foreground">{t.nav.archive}</Link>
              <Link href={`/${lang}/method`} className="hover:text-foreground">{t.nav.method}</Link>
            </nav>
            <BrokerLink variant="outline">{t.openAccount}</BrokerLink>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Saif Altamimi · 964FX</p>
      </div>
    </footer>
  );
}
