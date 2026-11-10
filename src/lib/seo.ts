import type { Metadata } from "next";
import { GSC_VERIFICATION, SITE_NAME, SITE_URL } from "@/lib/site";
import type { Lang } from "@/lib/i18n";

export const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"] as const;

export const pairNames: Record<string, { ar: string; en: string }> = {
  EURUSD: { ar: "تحليل اليورو دولار", en: "EUR/USD signal" },
  GBPUSD: { ar: "تحليل الجنيه دولار", en: "GBP/USD signal" },
  USDJPY: { ar: "تحليل الدولار ين", en: "USD/JPY signal" },
  USDCHF: { ar: "تحليل الدولار فرنك", en: "USD/CHF signal" },
  AUDUSD: { ar: "تحليل الدولار الأسترالي", en: "AUD/USD signal" },
  USDCAD: { ar: "تحليل الدولار الكندي", en: "USD/CAD signal" },
  NZDUSD: { ar: "تحليل الدولار النيوزيلندي", en: "NZD/USD signal" },
};

const pages = {
  home: {
    ar: {
      title: "964FX | توصيات فوركس مجانية",
      description: "توصيات فوركس مجانية ويومية من العراق، مع المفكرة الاقتصادية وتحليل اليورو دولار. سيف التميمي وسيط IC Markets.",
    },
    en: {
      title: "964FX | Free daily forex signals",
      description: "Free daily forex signals from Iraq, plus the economic calendar. Saif Altamimi is an IC Markets introducing broker.",
    },
  },
  signals: {
    ar: {
      title: "توصيات الفوركس اليومية | 964FX",
      description: "توصيات الفوركس اليومية لأزواج العملات الرئيسية، مع سبب محسوب ووقف وهدف. ليست نصيحة مالية.",
    },
    en: {
      title: "Daily forex signals | 964FX",
      description: "Daily forex signals for the majors, each with a stop, a target, and six measured reasons. Not financial advice.",
    },
  },
  news: {
    ar: {
      title: "أخبار الفوركس والمفكرة | 964FX",
      description: "المفكرة الاقتصادية وأخبار الفوركس لهذا الأسبوع بتوقيت بغداد، مع الفعلي عند صدوره.",
    },
    en: {
      title: "Forex news and calendar | 964FX",
      description: "This week's economic calendar and forex news, shown in Baghdad time and your local time.",
    },
  },
  method: {
    ar: {
      title: "منهج توصيات 964FX",
      description: "كيف تُبنى توصيات فوركس 964FX: المتوسطات وRSI وMACD وATR والتقويم، ومتى نتخطى الزوج.",
    },
    en: {
      title: "How 964FX signals are built",
      description: "The rules behind 964FX signals: moving averages, RSI, MACD, ATR, and the calendar. Unclear setups are skipped.",
    },
  },
  archive: {
    ar: {
      title: "أرشيف توصيات الفوركس | 964FX",
      description: "أرشيف توصيات فوركس 964FX: كل إشارة مغلقة بنتيجتها ونقاطها وتحديثاتها. لا نعدّل النتائج.",
    },
    en: {
      title: "Forex signal archive | 964FX",
      description: "Archive of closed 964FX forex signals with results, pips, and the four-hour update timeline.",
    },
  },
} as const;

export function pageMeta(lang: Lang, key: keyof typeof pages, path = ""): Metadata {
  const copy = pages[key][lang];
  return meta(lang, path, copy.title, copy.description);
}

export function pairMeta(lang: Lang, pair: string): Metadata {
  const name = pairNames[pair] ?? { ar: pair, en: pair };
  const title = lang === "ar" ? `${name.ar} | 964FX` : `${name.en} | 964FX`;
  const description =
    lang === "ar"
      ? `${name.ar}: توصيات فوركس يومية مع الإيقاف والهدف وستة أسباب. ليست نصيحة مالية.`
      : `${name.en}: daily forex signal with stop, target, and six reasons. Not financial advice.`;
  return meta(lang, `/signals/${pair.toLowerCase()}`, title, description);
}

export function archiveMeta(lang: Lang, id: string, pair: string): Metadata {
  const title = lang === "ar" ? `أرشيف ${pair} | 964FX` : `${pair} archived signal | 964FX`;
  const description =
    lang === "ar"
      ? `السجل الدائم للإشارة ${id} مع الأسباب والتحديثات والنتيجة.`
      : `Permanent record of signal ${id}, with reasons, updates, and the result.`;
  return meta(lang, `/archive/${id}`, title, description);
}

function meta(lang: Lang, path: string, title: string, description: string): Metadata {
  const suffix = path ? (path.endsWith("/") ? path : `${path}/`) : "/";
  const canonicalPath = `/${lang}${suffix}`;
  const ar = `${SITE_URL}/ar${suffix}`;
  const en = `${SITE_URL}/en${suffix}`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages: { ar, en, "x-default": ar },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      locale: lang === "ar" ? "ar_IQ" : "en_US",
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
        inLanguage: ["ar", "en"],
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
