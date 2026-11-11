import { JsonLd } from "@/components/json-ld";
import { MethodView } from "@/components/method-view";
import { breadcrumbLd, faqPageLd, pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "method", "/method"));
}

export default async function MethodPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = dict(lang as Lang);
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: d.nav.method, path: "/method/" }])} />
      <JsonLd data={faqPageLd(lang as Lang)} />
      <MethodView />
    </>
  );
}
