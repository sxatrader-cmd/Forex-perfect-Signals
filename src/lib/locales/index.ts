import type { Lang } from "@/lib/langs";
import { ar } from "./ar";
import { de } from "./de";
import { en, type Dict } from "./en";
import { es } from "./es";
import { fa } from "./fa";
import { fr } from "./fr";
import { hi } from "./hi";
import { pt } from "./pt";
import { ru } from "./ru";
import { ta } from "./ta";
import { tr } from "./tr";
import { zhCn } from "./zh-cn";
import { zhTw } from "./zh-tw";

/** Server-side only: each page sends just its own dictionary to the browser. */
export const dictionaries: Record<Lang, Dict> = {
  ar,
  en,
  "zh-cn": zhCn,
  "zh-tw": zhTw,
  fr,
  de,
  es,
  pt,
  ru,
  hi,
  ta,
  tr,
  fa,
};

export function dict(lang: Lang): Dict {
  return dictionaries[lang] ?? en;
}

export function clientCopy(lang: Lang) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { seo, ...rest } = dict(lang);
  return rest;
}
