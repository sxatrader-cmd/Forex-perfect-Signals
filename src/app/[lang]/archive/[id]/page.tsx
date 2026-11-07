import { notFound } from "next/navigation";
import { ArchiveDetail } from "@/components/archive-view";
import { JsonLd } from "@/components/json-ld";
import { historyData } from "@/lib/market-data";
import { archiveMeta, breadcrumbLd } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  const rows = historyData.closed;
  if (!rows.length) return [{ lang: "ar", id: "empty" }, { lang: "en", id: "empty" }];
  return ["ar", "en"].flatMap((lang) => rows.map((signal) => ({ lang, id: signal.id })));
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
  return (
    <>
      <JsonLd
        data={breadcrumbLd(lang as Lang, [
          { name: "964FX", path: "/" },
          { name: lang === "ar" ? "الأرشيف" : "Archive", path: "/archive/" },
          { name: signal.id, path: `/archive/${signal.id}/` },
        ])}
      />
      <ArchiveDetail id={id} />
    </>
  );
}
