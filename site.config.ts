import config from "./site.config.json";

/** Public site URL with no trailing slash. Edit site.config.json to switch to https://964fx.com. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl).replace(/\/$/, "");

/** Project path on GitHub Pages, or "" once the site is served at the domain root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? new URL(SITE_URL).pathname).replace(/\/$/, "");

export const SITE_NAME = "964FX";

export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || config.gscVerification;

export const PLANNED_DOMAIN = config.plannedDomain;
