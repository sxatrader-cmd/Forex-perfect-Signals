import { JsonLd } from "@/components/json-ld";
import { SignalsView } from "@/components/signals-view";
import { signalsData } from "@/lib/market-data";
import { breadcrumbLd, pageH1, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { LANG_META, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "signals", "/signals"));
}

export default async function SignalsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = dict(lang as Lang);
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: d.datasetName,
    description: d.datasetDescription,
    inLanguage: LANG_META[lang as Lang].tag,
    url: `${SITE_URL}/${lang}/signals/`,
    dateModified: signalsData.updatedAt,
    creator: { "@type": "Organization", name: "964FX" },
    keywords: ["forex signals", "توصيات فوركس", "сигналы форекс", "signaux forex", "Forex Signale", "señales forex", "daily forex signals"],
  };
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: d.nav.signals, path: "/signals/" }])} />
      <JsonLd data={dataset} />
      <SignalsView heading={pageH1(lang as Lang, "signals")} />
    </>
  );
}
