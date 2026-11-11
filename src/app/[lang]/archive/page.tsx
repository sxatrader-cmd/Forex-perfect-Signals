import { JsonLd } from "@/components/json-ld";
import { ArchiveView } from "@/components/archive-view";
import { archiveListLd, breadcrumbLd, pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "archive", "/archive"));
}

export default async function ArchivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = dict(lang as Lang);
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: d.nav.archive, path: "/archive/" }])} />
      <JsonLd data={archiveListLd(lang as Lang)} />
      <ArchiveView />
    </>
  );
}
