import config from "./site.config.json";

/** Public site URL with no trailing slash. Set in site.config.json. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl).replace(/\/$/, "");

/** Project path prefix, or "" when the site is served at the domain root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? new URL(SITE_URL).pathname).replace(/\/$/, "");

export const SITE_NAME = "964FX";

export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || config.gscVerification;

export const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION || config.bingVerification;

export const YANDEX_VERIFICATION = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || config.yandexVerification;

export const PLANNED_DOMAIN = config.plannedDomain;
