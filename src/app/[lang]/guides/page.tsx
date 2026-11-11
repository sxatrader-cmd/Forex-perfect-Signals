import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GuidesIndexView } from "@/components/guide-view";
import { GUIDE_LANGS, guidePack } from "@/lib/guides";
import { breadcrumbLd, guidesIndexLd, guidesIndexMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => (guidePack(lang as Lang) ? guidesIndexMeta(lang as Lang) : {}));
}

export default async function GuidesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const pack = guidePack(lang as Lang);
  if (!pack) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd(lang as Lang, [{ name: "964FX", path: "/" }, { name: pack.nav, path: "/guides/" }])} />
      <JsonLd data={guidesIndexLd(lang as Lang)} />
      <GuidesIndexView lang={lang as Lang} pack={pack} />
    </>
  );
}
