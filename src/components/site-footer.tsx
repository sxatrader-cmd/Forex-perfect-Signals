"use client";

import Link from "next/link";
import { BrokerLink } from "@/components/broker-link";
import { Disclaimer } from "@/components/disclaimer";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <Disclaimer />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm font-medium text-primary">{t.ib}</p>
            <p className="text-sm text-muted-foreground" lang={t.ibExact.startsWith("و") ? "ar" : "en"}>
              {t.ibExact}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">{t.footerNote}</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">{t.nav.home}</Link>
              <Link href="/signals" className="hover:text-foreground">{t.nav.signals}</Link>
              <Link href="/news" className="hover:text-foreground">{t.nav.news}</Link>
              <Link href="/method" className="hover:text-foreground">{t.nav.method}</Link>
            </nav>
            <BrokerLink variant="outline">{t.openAccount}</BrokerLink>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Saif Altamimi · Forex Perfect Signal</p>
      </div>
    </footer>
  );
}
