import { JsonLd } from "@/components/json-ld";
import { MethodView } from "@/components/method-view";
import { faq } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "method", "/method"));
}

export default async function MethodPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq[lang as Lang].map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <>
      <JsonLd data={data} />
      <MethodView />
    </>
  );
}
