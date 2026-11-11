import { JsonLd } from "@/components/json-ld";
import { NewsView } from "@/components/news-view";
import { breadcrumbLd, newsPageLd, pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "news", "/news"));
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = dict(lang as Lang);
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: d.nav.news, path: "/news/" }])} />
      <JsonLd data={newsPageLd(lang as Lang)} />
      <NewsView />
    </>
  );
}
