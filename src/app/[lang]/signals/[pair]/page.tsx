import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PairView } from "@/components/pair-view";
import { breadcrumbLd, PAIRS, pairMeta } from "@/lib/seo";
import { LANGS, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => PAIRS.map((pair) => ({ lang, pair: pair.toLowerCase() })));
}

export function generateMetadata({ params }: { params: Promise<{ lang: string; pair: string }> }) {
  return params.then(({ lang, pair }) => pairMeta(lang as Lang, pair.toUpperCase()));
}

export default async function PairPage({ params }: { params: Promise<{ lang: string; pair: string }> }) {
  const { lang, pair } = await params;
  const code = pair.toUpperCase();
  if (!PAIRS.includes(code as (typeof PAIRS)[number])) notFound();
  const d = dict(lang as Lang);
  const name = d.pairNames[code] ?? code;
  return (
    <>
      <JsonLd
        data={breadcrumbLd(lang as Lang, [
          { name: "964FX", path: "/" },
          { name: d.nav.signals, path: "/signals/" },
          { name, path: `/signals/${pair.toLowerCase()}/` },
        ])}
      />
      <PairView pair={code} />
    </>
  );
}
