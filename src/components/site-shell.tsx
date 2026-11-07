import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { I18nProvider, type Lang } from "@/lib/i18n";
import { organizationLd } from "@/lib/seo";

export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={organizationLd()} />
      <SiteHeader />
      <main id="content" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </I18nProvider>
  );
}
