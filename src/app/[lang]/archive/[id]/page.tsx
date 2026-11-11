import { notFound } from "next/navigation";
import { ArchiveDetail } from "@/components/archive-view";
import { JsonLd } from "@/components/json-ld";
import { historyData } from "@/lib/market-data";
import { archiveMeta, breadcrumbLd, signalArticleLd } from "@/lib/seo";
import { LANGS, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  const rows = historyData.closed;
  if (!rows.length) return LANGS.map((lang) => ({ lang, id: "empty" }));
  return LANGS.flatMap((lang) => rows.map((signal) => ({ lang, id: signal.id })));
}

export function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }) {
  return params.then(({ lang, id }) => {
    const signal = historyData.closed.find((item) => item.id === id);
    return archiveMeta(lang as Lang, id, signal?.pair ?? id);
  });
}

export default async function ArchiveSignalPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (id === "empty") notFound();
  const signal = historyData.closed.find((item) => item.id === id);
  if (!signal) notFound();
  const url = `${SITE_URL}/${lang}/archive/${signal.id}/`;
  return (
    <>
      <JsonLd
        data={breadcrumbLd(lang as Lang, [
          { name: "964FX", path: "/" },
          { name: dict(lang as Lang).nav.archive, path: "/archive/" },
          { name: signal.id, path: `/archive/${signal.id}/` },
        ])}
      />
      <JsonLd data={signalArticleLd(lang as Lang, signal, url)} />
      <ArchiveDetail id={id} />
    </>
  );
}
