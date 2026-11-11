import type { Lang } from "@/lib/langs";

/**
 * Languages where the header/footer "Open account" button is hidden, because local rules
 * restrict offshore forex offers (Brazil CVM, India RBI, Sri Lanka CBSL / Malaysia BNM,
 * mainland China SAFE, Taiwan FSC / Hong Kong SFC, Turkey SPK). Decided by Saif, 2026-11-11.
 */
export const NO_SHELL_CTA_LANGS: readonly Lang[] = ["pt", "hi", "ta", "zh-cn", "zh-tw", "tr"];

export function showShellCta(lang: Lang) {
  return !NO_SHELL_CTA_LANGS.includes(lang);
}
