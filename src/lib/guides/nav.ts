import type { Lang } from "@/lib/langs";
import type { GuideSlug } from "./types";

/** Languages with hand-written guide pages. Others link to the home page instead. */
export const GUIDE_LANGS = ["ar", "en", "ru", "fr", "de", "es"] as const;
export type GuideLang = (typeof GUIDE_LANGS)[number];

export function hasGuides(lang: string): lang is GuideLang {
  return (GUIDE_LANGS as readonly string[]).includes(lang);
}

/** Small, client-safe labels for the header and footer. */
export const GUIDE_NAV: Record<GuideLang, { nav: string; labels: Record<GuideSlug, string> }> = {
  ar: {
    nav: "أدلة الفوركس",
    labels: {
      "xauusd-gold": "تحليل الذهب XAUUSD",
      "islamic-swap-free-account": "هل الفوركس حلال؟",
      "forex-for-beginners": "تعلم الفوركس للمبتدئين",
      "demo-account": "الحساب التجريبي",
      leverage: "الرافعة المالية",
    },
  },
  en: {
    nav: "Guides",
    labels: {
      "xauusd-gold": "XAUUSD gold",
      "islamic-swap-free-account": "Islamic account",
      "forex-for-beginners": "Forex for beginners",
      "demo-account": "Demo account",
      leverage: "Leverage",
    },
  },
  ru: {
    nav: "Обучение",
    labels: {
      "xauusd-gold": "Золото XAUUSD",
      "islamic-swap-free-account": "Исламский счет",
      "forex-for-beginners": "Форекс для начинающих",
      "demo-account": "Демо-счет",
      leverage: "Кредитное плечо",
    },
  },
  fr: {
    nav: "Guides",
    labels: {
      "xauusd-gold": "Or XAUUSD",
      "islamic-swap-free-account": "Compte islamique",
      "forex-for-beginners": "Forex pour débutant",
      "demo-account": "Compte démo",
      leverage: "Effet de levier",
    },
  },
  de: {
    nav: "Ratgeber",
    labels: {
      "xauusd-gold": "Gold XAUUSD",
      "islamic-swap-free-account": "Islamisches Konto",
      "forex-for-beginners": "Forex für Anfänger",
      "demo-account": "Demokonto",
      leverage: "Hebel",
    },
  },
  es: {
    nav: "Guías",
    labels: {
      "xauusd-gold": "Oro XAUUSD",
      "islamic-swap-free-account": "Cuenta islámica",
      "forex-for-beginners": "Forex para principiantes",
      "demo-account": "Cuenta demo",
      leverage: "Apalancamiento",
    },
  },
};

export function guideNav(lang: Lang) {
  return hasGuides(lang) ? GUIDE_NAV[lang] : undefined;
}
