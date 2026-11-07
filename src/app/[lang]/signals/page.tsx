import { JsonLd } from "@/components/json-ld";
import { SignalsView } from "@/components/signals-view";
import { signalsData } from "@/lib/market-data";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Lang } from "@/lib/i18n";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "signals", "/signals"));
}

export default async function SignalsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: lang === "ar" ? "توصيات 964FX اليومية" : "964FX daily forex signals",
    description: lang === "ar" ? "إشارات تعليمية مفتوحة ومغلقة لأزواج العملات الرئيسية." : "Open and closed educational signals for the major forex pairs.",
    url: `${SITE_URL}/${lang}/signals/`,
    dateModified: signalsData.updatedAt,
    creator: { "@type": "Organization", name: "964FX" },
    keywords: ["forex signals", "توصيات فوركس", "daily forex signals"],
  };
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: lang === "ar" ? "الإشارات" : "Signals", path: "/signals/" }])} />
      <JsonLd data={dataset} />
      <SignalsView />
    </>
  );
}
