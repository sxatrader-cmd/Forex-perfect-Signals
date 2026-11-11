import type { Metadata } from "next";
import { historyData, signalsData } from "@/lib/market-data";
import { BING_VERIFICATION, GSC_VERIFICATION, SITE_NAME, SITE_URL, YANDEX_VERIFICATION } from "@/lib/site";
import { fill, LANG_META, LANGS, pickText, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";
import type { Signal } from "@/lib/types";

export const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"] as const;

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
  const copy = dict(lang).seo[key];
  return meta(lang, path, copy.title, copy.description);
}

export function pairMeta(lang: Lang, pair: string): Metadata {
  const d = dict(lang);
  const name = d.pairNames[pair] ?? pair;
  const signal = openSignalFor(pair);
  return meta(
    lang,
    `/signals/${pair.toLowerCase()}`,
    fill(d.seo.pairTitle, { name }),
    fill(d.seo.pairDescription, { name }),
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

function meta(lang: Lang, path: string, title: string, description: string, article?: ArticleTimes): Metadata {
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
    name: d.seo.calendar.title,
    description: d.seo.calendar.description,
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
    name: fill(d.seo.pairTitle, { name }),
    description: fill(d.seo.pairDescription, { name }),
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
