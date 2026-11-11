"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { LANG_META, type Lang } from "@/lib/langs";
import type { Dict } from "@/lib/locales/en";

export type { Lang } from "@/lib/langs";

/** The dictionary sent to the browser: everything except page metadata. */
export type Copy = Omit<Dict, "seo">;

type Ctx = { lang: Lang; t: Copy };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ lang, t, children }: { lang: Lang; t: Copy; children: ReactNode }) {
  useEffect(() => {
    // Keep <html lang/dir> right after client-side navigation between languages.
    const root = document.documentElement;
    root.lang = LANG_META[lang].tag;
    root.dir = LANG_META[lang].dir;
  }, [lang]);
  return <I18nContext.Provider value={{ lang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
