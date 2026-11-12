import type { Metadata } from "next";
import { historyData, signalsData } from "@/lib/market-data";
import { BING_VERIFICATION, GSC_VERIFICATION, SITE_NAME, SITE_URL, YANDEX_VERIFICATION } from "@/lib/site";
import { fill, LANG_META, LANGS, pickText, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";
import type { Signal } from "@/lib/types";
import { pairValues, seoCopy } from "@/lib/seo-copy";
import { GUIDE_LANGS, GUIDES_REVIEWED, guidePack, type GuideSlug } from "@/lib/guides";

export const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD", "GBPJPY", "GBPAUD", "GBPCAD", "GBPNZD", "EURGBP", "EURJPY", "EURCAD"] as const;

const ORG_ID = `${SITE_URL}/#organization`;
const LOGO_URL = `${SITE_URL}/logo-square.png`;
const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "964FX" };

export function siteVerification(): Metadata["verification"] {
  const other: Record<string, string> = {};
  if (BING_VERIFICATION) other["msvalidate.01"] = BING_VERIFICATION;
  const verification: NonNullable<Metadata["verification"]> = {};
  if (GSC_VERIFICATION) verification.google = GSC_VERIFICATION;
  if (YANDEX_VERIFICATION) verification.yandex = YANDEX_VERIFICATION;
  if (Object.keys(other).length) verification.other = other;
  return Object.keys(verification).length ? verification : undefined;
}

type PageKey = "home" | "signals" | "news" | "calendar" | "method" | "archive";

type ArticleTimes = {
  publishedTime: string;
  modifiedTime?: string;
};

export function pageMeta(lang: Lang, key: PageKey, path = ""): Metadata {
  const override = key === "signals" || key === "calendar" ? seoCopy(lang)?.[key] : undefined;
  const copy = override ?? dict(lang).seo[key];
  return meta(lang, path, copy.title, copy.description);
}

export function pairMeta(lang: Lang, pair: string): Metadata {
  const d = dict(lang);
  const name = d.pairNames[pair] ?? pair;
  const signal = openSignalFor(pair);
  const copy = seoCopy(lang);
  const values = { name, ...pairValues(lang, pair) };
  return meta(
    lang,
    `/signals/${pair.toLowerCase()}`,
    fill(copy?.pairTitle ?? d.seo.pairTitle, values),
    fill(copy?.pairDescription ?? d.seo.pairDescription, values),
    signal ? articleTimes(signal) : undefined,
  );
}

export function archiveMeta(lang: Lang, id: string, pair: string): Metadata {
  const d = dict(lang);
  const signal = closedSignalById(id);
  return meta(
    lang,
    `/archive/${id}`,
    fill(d.seo.archiveTitle, { pair, id }),
    fill(d.seo.archiveDescription, { pair, id }),
    signal ? articleTimes(signal) : undefined,
  );
}

function articleTimes(signal: Signal): ArticleTimes {
  return {
    publishedTime: signal.issuedAt,
    modifiedTime: signal.closedAt || signal.priceAsOf || signal.issuedAt,
  };
}

function meta(
  lang: Lang,
  path: string,
  title: string,
  description: string,
  article?: ArticleTimes,
  only: readonly Lang[] = LANGS,
): Metadata {
  const suffix = path ? (path.endsWith("/") ? path : `${path}/`) : "/";
  const canonicalPath = `/${lang}${suffix}`;
  const languages: Record<string, string> = {};
  for (const code of only) languages[LANG_META[code].tag] = `${SITE_URL}/${code}${suffix}`;
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
      alternateLocale: only.filter((code) => code !== lang).map((code) => LANG_META[code].og),
      type: article ? "article" : "website",
      images: [OG_IMAGE],
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
            authors: ["964FX"],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
    verification: siteVerification(),
  };
}

export function openSignalFor(pair: string) {
  return signalsData.open.find((item) => item.pair === pair);
}

export function closedSignalById(id: string) {
  return historyData.closed.find((item) => item.id === id);
}

function orgDescription(lang: Lang) {
  if (lang === "ar") {
    return "موقع توصيات فوركس مجانية للأزواج الرئيسية، مع أسباب فنية وأساسية وأخبار Forex Factory وتتبع علني وأرشيف. يديره سيف التميمي، وسيط معرّف لدى IC Markets. التحليل تعليمي وليس نصيحة مالية.";
  }
  return "Free forex signals for the major pairs, with fundamental and technical reasons, live Forex Factory news, and a public archive. Run by Saif Altamimi, an IC Markets Introducing Broker. Educational analysis, not financial advice.";
}

export function organizationLd(lang: Lang = "ar") {
  const home = `${SITE_URL}/${lang}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "964FX",
        url: `${SITE_URL}/ar/`,
        logo: {
          "@type": "ImageObject",
          url: LOGO_URL,
          width: 759,
          height: 800,
        },
        image: `${SITE_URL}/og.png`,
        description: orgDescription(lang),
        founder: {
          "@type": "Person",
          name: "Saif Altamimi",
          jobTitle: "Introducing Broker for IC Markets",
        },
        knowsAbout: ["forex signals", "توصيات فوركس", "EURUSD", "economic calendar"],
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: "964FX",
        url: home,
        inLanguage: LANG_META[lang].tag,
        description: orgDescription(lang),
        publisher: { "@id": ORG_ID },
        about: { "@id": ORG_ID },
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

export function faqPageLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: LANG_META[lang].tag,
    url: `${SITE_URL}/${lang}/method/`,
    mainEntity: dict(lang).faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function newsPageLd(lang: Lang) {
  const d = dict(lang);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: d.seo.news.title,
    description: d.seo.news.description,
    inLanguage: LANG_META[lang].tag,
    url: `${SITE_URL}/${lang}/news/`,
    isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
  };
}

export function calendarPageLd(lang: Lang) {
  const d = dict(lang);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: (seoCopy(lang)?.calendar ?? d.seo.calendar).title,
    description: (seoCopy(lang)?.calendar ?? d.seo.calendar).description,
    inLanguage: LANG_META[lang].tag,
    url: `${SITE_URL}/${lang}/calendar/`,
    isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
  };
}

export function archiveListLd(lang: Lang) {
  const d = dict(lang);
  const items = historyData.closed.filter((item) => item.id && item.id !== "empty");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: d.seo.archive.title,
    description: d.seo.archive.description,
    inLanguage: LANG_META[lang].tag,
    url: `${SITE_URL}/${lang}/archive/`,
    isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((signal, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: archiveHeadline(signal),
        url: `${SITE_URL}/${lang}/archive/${signal.id}/`,
      })),
    },
  };
}

export function pairPageLd(lang: Lang, pair: string) {
  const d = dict(lang);
  const name = d.pairNames[pair] ?? pair;
  const url = `${SITE_URL}/${lang}/signals/${pair.toLowerCase()}/`;
  const signal = openSignalFor(pair);
  if (signal) return signalArticleLd(lang, signal, url);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: fill(seoCopy(lang)?.pairTitle ?? d.seo.pairTitle, { name, ...pairValues(lang, pair) }),
    description: fill(seoCopy(lang)?.pairDescription ?? d.seo.pairDescription, { name, ...pairValues(lang, pair) }),
    inLanguage: LANG_META[lang].tag,
    url,
    isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
    about: { "@type": "Thing", name: pair },
  };
}

export function signalArticleLd(lang: Lang, signal: Signal, url: string) {
  const body = (signal.reasons ?? []).map((reason) => pickText(lang, reason)).filter(Boolean).join(" ");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleHeadline(signal),
    description: articleDescription(lang, signal),
    inLanguage: LANG_META[lang].tag,
    datePublished: signal.issuedAt,
    dateModified: signal.closedAt || signal.priceAsOf || signal.issuedAt,
    url,
    mainEntityOfPage: url,
    image: `${SITE_URL}/og.png`,
    author: { "@type": "Organization", "@id": ORG_ID, name: "964FX", url: `${SITE_URL}/ar/` },
    publisher: { "@type": "Organization", "@id": ORG_ID, name: "964FX", logo: { "@type": "ImageObject", url: LOGO_URL } },
    about: { "@type": "Thing", name: signal.pair },
    ...(body ? { articleBody: body } : {}),
  };
}

function articleHeadline(signal: Signal) {
  if (signal.status === "closed") {
    const result = signal.result ? ` ${signal.result}` : "";
    return `${signal.pair} ${signal.direction}${result}`.trim();
  }
  return `${signal.pair} ${signal.direction}`;
}

function archiveHeadline(signal: Signal) {
  const result = signal.result ? ` ${signal.result}` : "";
  return `${signal.pair} ${signal.direction}${result}`.trim();
}

function articleDescription(lang: Lang, signal: Signal) {
  const levels = `Entry ${signal.entry}, SL ${signal.sl}, TP ${signal.tp}`;
  if (lang === "ar") {
    if (signal.status === "closed") {
      const result = signal.result === "TP" ? "الهدف" : signal.result === "SL" ? "الإيقاف" : "مغلقة";
      const pips = signal.pips != null ? `، ${signal.pips} نقطة` : "";
      return `سجل إشارة ${signal.pair} ${signal.direction} التي أُغلقت عند ${result}${pips}. الدخول ${signal.entry}، الإيقاف ${signal.sl}، الهدف ${signal.tp}. تحليل تعليمي وليس نصيحة مالية.`;
    }
    return `إشارة ${signal.pair} ${signal.direction} المفتوحة: الدخول ${signal.entry}، الإيقاف ${signal.sl}، الهدف ${signal.tp}. تحليل تعليمي وليس نصيحة مالية.`;
  }
  if (signal.status === "closed") {
    const result = signal.result ?? "closed";
    const pips = signal.pips != null ? `, ${signal.pips} pips` : "";
    return `Archived ${signal.pair} ${signal.direction} signal, closed at ${result}${pips}. ${levels}. Educational analysis, not financial advice.`;
  }
  return `Open ${signal.pair} ${signal.direction} signal. ${levels}. Educational analysis, not financial advice.`;
}

/** H1 for the signals or calendar page, falling back to the locale file. */
export function pageH1(lang: Lang, key: "signals" | "calendar"): string | undefined {
  return seoCopy(lang)?.[key].h1;
}

export function pairH1(lang: Lang, pair: string): string | undefined {
  const copy = seoCopy(lang);
  return copy ? fill(copy.pairH1, pairValues(lang, pair)) : undefined;
}

export function guidesIndexMeta(lang: Lang): Metadata {
  const pack = guidePack(lang)!;
  return meta(lang, "/guides", pack.index.title, pack.index.description, undefined, GUIDE_LANGS);
}

export function guideMeta(lang: Lang, slug: GuideSlug): Metadata {
  const guide = guidePack(lang)!.guides[slug];
  return meta(
    lang,
    `/guides/${slug}`,
    guide.title,
    guide.description,
    { publishedTime: `${GUIDES_REVIEWED}T00:00:00Z`, modifiedTime: `${GUIDES_REVIEWED}T00:00:00Z` },
    GUIDE_LANGS,
  );
}

export function guideLd(lang: Lang, slug: GuideSlug) {
  const guide = guidePack(lang)!.guides[slug];
  const url = `${SITE_URL}/${lang}/guides/${slug}/`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.h1,
      description: guide.description,
      inLanguage: LANG_META[lang].tag,
      datePublished: GUIDES_REVIEWED,
      dateModified: GUIDES_REVIEWED,
      url,
      mainEntityOfPage: url,
      image: `${SITE_URL}/og.png`,
      author: { "@type": "Organization", "@id": ORG_ID, name: "964FX", url: `${SITE_URL}/ar/` },
      publisher: { "@type": "Organization", "@id": ORG_ID, name: "964FX", logo: { "@type": "ImageObject", url: LOGO_URL } },
      isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: LANG_META[lang].tag,
      url,
      mainEntity: guide.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

export function guidesIndexLd(lang: Lang) {
  const pack = guidePack(lang)!;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pack.index.title,
    description: pack.index.description,
    inLanguage: LANG_META[lang].tag,
    url: `${SITE_URL}/${lang}/guides/`,
    isPartOf: { "@id": `${SITE_URL}/${lang}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: Object.entries(pack.guides).map(([slug, guide], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.h1,
        url: `${SITE_URL}/${lang}/guides/${slug}/`,
      })),
    },
  };
}
