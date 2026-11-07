import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PairView } from "@/components/pair-view";
import { breadcrumbLd, PAIRS, pairMeta, pairNames } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return ["ar", "en"].flatMap((lang) => PAIRS.map((pair) => ({ lang, pair: pair.toLowerCase() })));
}

export function generateMetadata({ params }: { params: Promise<{ lang: string; pair: string }> }) {
  return params.then(({ lang, pair }) => pairMeta(lang as Lang, pair.toUpperCase()));
}

export default async function PairPage({ params }: { params: Promise<{ lang: string; pair: string }> }) {
  const { lang, pair } = await params;
  const code = pair.toUpperCase();
  if (!PAIRS.includes(code as (typeof PAIRS)[number])) notFound();
  const name = pairNames[code]?.[lang as Lang] ?? code;
  return (
    <>
      <JsonLd
        data={breadcrumbLd(lang as Lang, [
          { name: "964FX", path: "/" },
          { name: lang === "ar" ? "الإشارات" : "Signals", path: "/signals/" },
          { name, path: `/signals/${pair.toLowerCase()}/` },
        ])}
      />
      <PairView pair={code} />
    </>
  );
}
