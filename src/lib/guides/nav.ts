import type { Lang } from "@/lib/langs";
import type { GuideSlug } from "./types";

/** Languages with hand-written guide pages (all 13 since 2026-11-11). */
export const GUIDE_LANGS = ["ar", "en", "zh-cn", "zh-tw", "fr", "de", "es", "pt", "ru", "hi", "ta", "tr", "fa"] as const;
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
  pt: {
    nav: "Guias",
    labels: {
      "xauusd-gold": "Ouro XAUUSD",
      "islamic-swap-free-account": "Conta islâmica",
      "forex-for-beginners": "Forex para iniciantes",
      "demo-account": "Conta demo",
      leverage: "Alavancagem",
    },
  },
  tr: {
    nav: "Rehberler",
    labels: {
      "xauusd-gold": "Forex altın XAUUSD",
      "islamic-swap-free-account": "Forex caiz mi?",
      "forex-for-beginners": "Forex nedir?",
      "demo-account": "Demo hesap",
      leverage: "Kaldıraç",
    },
  },
  "zh-cn": {
    nav: "外汇教程",
    labels: {
      "xauusd-gold": "黄金 XAUUSD",
      "islamic-swap-free-account": "伊斯兰账户",
      "forex-for-beginners": "什么是外汇",
      "demo-account": "模拟交易",
      leverage: "外汇杠杆",
    },
  },
  "zh-tw": {
    nav: "外匯教學",
    labels: {
      "xauusd-gold": "黃金 XAUUSD",
      "islamic-swap-free-account": "伊斯蘭帳戶",
      "forex-for-beginners": "外匯入門",
      "demo-account": "模擬交易",
      leverage: "外匯槓桿",
    },
  },
  hi: {
    nav: "फॉरेक्स गाइड",
    labels: {
      "xauusd-gold": "XAUUSD गोल्ड",
      "islamic-swap-free-account": "इस्लामिक अकाउंट",
      "forex-for-beginners": "फॉरेक्स क्या है",
      "demo-account": "डेमो अकाउंट",
      leverage: "लीवरेज",
    },
  },
  ta: {
    nav: "Forex வழிகாட்டி",
    labels: {
      "xauusd-gold": "XAUUSD தங்கம்",
      "islamic-swap-free-account": "இஸ்லாமிய கணக்கு",
      "forex-for-beginners": "Forex என்றால் என்ன",
      "demo-account": "டெமோ கணக்கு",
      leverage: "லீவரேஜ்",
    },
  },
  fa: {
    nav: "آموزش فارکس",
    labels: {
      "xauusd-gold": "طلا XAUUSD",
      "islamic-swap-free-account": "حساب اسلامی",
      "forex-for-beginners": "فارکس چیست",
      "demo-account": "حساب دمو",
      leverage: "لوریج",
    },
  },
};

export function guideNav(lang: Lang) {
  return hasGuides(lang) ? GUIDE_NAV[lang] : undefined;
}
