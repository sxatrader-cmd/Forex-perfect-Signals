import type { Lang } from "@/lib/langs";
import { ar } from "./ar";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ru } from "./ru";
import { GUIDE_LANGS, type GuideLang } from "./nav";
import { GUIDE_SLUGS, type GuidePack, type GuideSlug } from "./types";

export { GUIDE_LANGS, hasGuides } from "./nav";
export { GUIDE_SLUGS } from "./types";
export type { GuideLang, GuidePack, GuideSlug };

/** Server-side only: the full guide copy. */
const packs: Record<GuideLang, GuidePack> = { ar, en, ru, fr, de, es };

/** Date the guide copy was last reviewed by hand. */
export const GUIDES_REVIEWED = "2026-11-11";

export function guidePack(lang: Lang): GuidePack | undefined {
  return (GUIDE_LANGS as readonly string[]).includes(lang) ? packs[lang as GuideLang] : undefined;
}

export function isGuideSlug(value: string): value is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(value);
}
