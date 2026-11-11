export const GUIDE_SLUGS = [
  "xauusd-gold",
  "islamic-swap-free-account",
  "forex-for-beginners",
  "demo-account",
  "leverage",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type GuideSection = {
  h: string;
  p: string[];
  list?: string[];
};

export type Guide = {
  /** <title>, about 60 characters. */
  title: string;
  /** Meta description, about 150 characters. */
  description: string;
  h1: string;
  /** Short label for nav and cards. */
  label: string;
  lede: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
};

export type GuidePack = {
  nav: string;
  index: { title: string; description: string; h1: string; lede: string };
  ui: {
    faq: string;
    next: string;
    signals: string;
    calendar: string;
    telegram: string;
    method: string;
    liveChart: string;
    liveChartNote: string;
    disclosureTitle: string;
    disclosure: string;
    riskTitle: string;
    risk: string;
    updated: string;
    read: string;
    otherGuides: string;
  };
  guides: Record<GuideSlug, Guide>;
};
