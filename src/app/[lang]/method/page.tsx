import { JsonLd } from "@/components/json-ld";
import { MethodView } from "@/components/method-view";
import { pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "method", "/method"));
}

export default async function MethodPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict(lang as Lang).faq.map((item) => ({
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
