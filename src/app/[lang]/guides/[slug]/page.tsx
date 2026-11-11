import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GuideView } from "@/components/guide-view";
import { GUIDE_LANGS, GUIDE_SLUGS, guidePack, isGuideSlug } from "@/lib/guides";
import { breadcrumbLd, guideLd, guideMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_LANGS.flatMap((lang) => GUIDE_SLUGS.map((slug) => ({ lang, slug })));
}

export function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  return params.then(({ lang, slug }) =>
    guidePack(lang as Lang) && isGuideSlug(slug) ? guideMeta(lang as Lang, slug) : {},
  );
}

export default async function GuidePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const pack = guidePack(lang as Lang);
  if (!pack || !isGuideSlug(slug)) notFound();
  const guide = pack.guides[slug];
  return (
    <>
      <JsonLd
        data={breadcrumbLd(lang as Lang, [
          { name: "964FX", path: "/" },
          { name: pack.nav, path: "/guides/" },
          { name: guide.label, path: `/guides/${slug}/` },
        ])}
      />
      {guideLd(lang as Lang, slug).map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
      <GuideView lang={lang as Lang} pack={pack} slug={slug} />
    </>
  );
}
