/** Every UI language the site is built in. Route segment first; ar stays the default. */
export const LANGS = ["ar", "en", "zh-cn", "zh-tw", "fr", "de", "es", "pt", "ru", "hi", "ta", "tr", "fa"] as const;

export type Lang = (typeof LANGS)[number];

type Meta = {
  /** Native name shown in the switcher. */
  label: string;
  /** BCP 47 tag for html lang and hreflang. */
  tag: string;
  dir: "rtl" | "ltr";
  /** Locale passed to Intl for dates and times. */
  intl: string;
  /** Open Graph locale. */
  og: string;
};

export const LANG_META: Record<Lang, Meta> = {
  ar: { label: "العربية", tag: "ar", dir: "rtl", intl: "ar-EG", og: "ar_IQ" },
  en: { label: "English", tag: "en", dir: "ltr", intl: "en-GB", og: "en_US" },
  "zh-cn": { label: "简体中文", tag: "zh-CN", dir: "ltr", intl: "zh-CN", og: "zh_CN" },
  "zh-tw": { label: "繁體中文", tag: "zh-TW", dir: "ltr", intl: "zh-TW", og: "zh_TW" },
  fr: { label: "Français", tag: "fr", dir: "ltr", intl: "fr-FR", og: "fr_FR" },
  de: { label: "Deutsch", tag: "de", dir: "ltr", intl: "de-DE", og: "de_DE" },
  es: { label: "Español", tag: "es", dir: "ltr", intl: "es-ES", og: "es_ES" },
  pt: { label: "Português", tag: "pt", dir: "ltr", intl: "pt-BR", og: "pt_BR" },
  ru: { label: "Русский", tag: "ru", dir: "ltr", intl: "ru-RU", og: "ru_RU" },
  hi: { label: "हिन्दी", tag: "hi", dir: "ltr", intl: "hi-IN", og: "hi_IN" },
  ta: { label: "தமிழ்", tag: "ta", dir: "ltr", intl: "ta-IN", og: "ta_IN" },
  tr: { label: "Türkçe", tag: "tr", dir: "ltr", intl: "tr-TR", og: "tr_TR" },
  fa: { label: "فارسی", tag: "fa", dir: "rtl", intl: "fa-IR-u-ca-gregory", og: "fa_IR" },
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function dirOf(lang: Lang) {
  return LANG_META[lang].dir;
}

/**
 * Signal reasons, updates, and scan notes are generated in Arabic and English only.
 * Arabic pages read the Arabic text; every other language falls back to English.
 */
export function pickText(lang: Lang, text: { ar: string; en: string }) {
  return lang === "ar" ? text.ar : text.en;
}

/** lang/dir attributes for data text, so English fallback renders left-to-right inside RTL pages. */
export function textAttrs(lang: Lang): { lang: string; dir: "rtl" | "ltr" } {
  if (lang === "ar") return { lang: "ar", dir: "rtl" };
  return { lang: "en", dir: "ltr" };
}

/** Replace {name} placeholders. */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}
