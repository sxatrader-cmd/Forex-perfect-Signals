import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { I18nProvider } from "@/lib/i18n";
import { LANG_META, type Lang } from "@/lib/langs";
import { clientCopy } from "@/lib/locales";
import { organizationLd } from "@/lib/seo";

export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <I18nProvider lang={lang} t={clientCopy(lang)}>
      <JsonLd data={organizationLd()} />
      <SiteHeader />
      <main id="content" lang={LANG_META[lang].tag} dir={LANG_META[lang].dir} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </I18nProvider>
  );
}
