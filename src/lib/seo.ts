import type { Metadata } from "next";
import { GSC_VERIFICATION, SITE_NAME, SITE_URL } from "@/lib/site";
import { fill, LANG_META, LANGS, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

export const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"] as const;

type PageKey = "home" | "signals" | "news" | "method" | "archive";

export function pageMeta(lang: Lang, key: PageKey, path = ""): Metadata {
  const copy = dict(lang).seo[key];
  return meta(lang, path, copy.title, copy.description);
}

export function pairMeta(lang: Lang, pair: string): Metadata {
  const d = dict(lang);
  const name = d.pairNames[pair] ?? pair;
  return meta(lang, `/signals/${pair.toLowerCase()}`, fill(d.seo.pairTitle, { name }), fill(d.seo.pairDescription, { name }));
}

export function archiveMeta(lang: Lang, id: string, pair: string): Metadata {
  const d = dict(lang);
  return meta(lang, `/archive/${id}`, fill(d.seo.archiveTitle, { pair, id }), fill(d.seo.archiveDescription, { pair, id }));
}

function meta(lang: Lang, path: string, title: string, description: string): Metadata {
  const suffix = path ? (path.endsWith("/") ? path : `${path}/`) : "/";
  const canonicalPath = `/${lang}${suffix}`;
  const languages: Record<string, string> = {};
  for (const code of LANGS) languages[LANG_META[code].tag] = `${SITE_URL}/${code}${suffix}`;
  languages["x-default"] = `${SITE_URL}/ar${suffix}`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      locale: LANG_META[lang].og,
      alternateLocale: LANGS.filter((code) => code !== lang).map((code) => LANG_META[code].og),
      type: "website",
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "964FX" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og.png`],
    },
    verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "964FX",
        url: `${SITE_URL}/ar/`,
        logo: `${SITE_URL}/logo-square.png`,
        description: "Educational Iraqi forex signals. Saif Altamimi is an Introducing Broker for IC Markets.",
      },
      {
        "@type": "WebSite",
        name: "964FX",
        url: `${SITE_URL}/ar/`,
        inLanguage: LANGS.map((code) => LANG_META[code].tag),
      },
    ],
  };
}

export function breadcrumbLd(lang: Lang, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}/${lang}${crumb.path}`,
    })),
  };
}
