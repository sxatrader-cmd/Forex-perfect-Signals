import type { Lang } from "@/lib/langs";

/**
 * Keyword-targeted titles, descriptions, and H1s for the signals, calendar, and pair pages.
 * Languages not listed here keep the copy from their locale file.
 */
type PageCopy = { title: string; description: string; h1: string };
type SeoCopy = {
  signals: PageCopy;
  calendar: PageCopy;
  /** {pair} = "EUR/USD", {local} = local name of the pair. */
  pairTitle: string;
  pairDescription: string;
  pairH1: string;
  pairLocal?: Record<string, string>;
};

const COPY: Partial<Record<Lang, SeoCopy>> = {
  en: {
    signals: {
      title: "Forex signals today: free daily signals with SL & TP | 964FX",
      description: "Free daily forex signals for EUR/USD, GBP/USD and the other majors, each with entry, stop loss, take profit and six reasons. Public archive. Not financial advice.",
      h1: "Free daily forex signals",
    },
    calendar: {
      title: "Forex economic calendar this week, live in your time | 964FX",
      description: "Live forex economic calendar: high and medium impact events with actual, forecast and previous, updated as data is released, in your local time.",
      h1: "Forex economic calendar",
    },
    pairTitle: "{pair} forex signal & analysis: entry, SL, TP | 964FX",
    pairDescription: "{pair} forex signal and live analysis: current setup, entry, stop loss and take profit, six reasons, chart and closed results. Educational, not advice.",
    pairH1: "{pair} forex signal & analysis",
  },
  ar: {
    signals: {
      title: "توصيات فوركس مجانية يومية مع الوقف والهدف | 964FX",
      description: "توصيات فوركس مجانية يومياً على اليورو دولار والجنيه وباقي الأزواج الرئيسية، مع الدخول ووقف الخسارة والهدف وستة أسباب وأرشيف علني. ليست نصيحة مالية.",
      h1: "توصيات فوركس يومية مجانية",
    },
    calendar: {
      title: "المفكرة الاقتصادية للفوركس هذا الأسبوع مباشر | 964FX",
      description: "التقويم الاقتصادي (المفكرة الاقتصادية) للفوركس مباشر: الأخبار القوية والمتوسطة مع الفعلي والمتوقع والسابق، يتحدث لحظة صدور الخبر وبتوقيتك المحلي.",
      h1: "التقويم الاقتصادي للفوركس",
    },
    pairTitle: "توصية {local} {pair} وتحليله: الدخول والوقف والهدف | 964FX",
    pairDescription: "توصية {local} ({pair}) وتحليله المباشر: الإعداد الحالي، الدخول ووقف الخسارة والهدف، ستة أسباب، الشارت والنتائج المغلقة. تحليل تعليمي وليس نصيحة.",
    pairH1: "توصية وتحليل {local} ({pair})",
    pairLocal: {
      EURUSD: "اليورو دولار",
      GBPUSD: "الجنيه دولار",
      USDJPY: "الدولار ين",
      USDCHF: "الدولار فرنك",
      AUDUSD: "الأسترالي دولار",
      USDCAD: "الدولار كندي",
      NZDUSD: "النيوزيلندي دولار",
    },
  },
  ru: {
    signals: {
      title: "Сигналы форекс бесплатно: каждый день со стоп-лоссом | 964FX",
      description: "Бесплатные сигналы форекс каждый день по EUR/USD, GBP/USD и другим мажорам: вход, стоп-лосс, тейк-профит и шесть причин. Публичный архив. Не инвестиционная рекомендация.",
      h1: "Бесплатные сигналы форекс на каждый день",
    },
    calendar: {
      title: "Экономический календарь форекс на неделю онлайн | 964FX",
      description: "Экономический календарь форекс онлайн: важные и средние события с фактом, прогнозом и предыдущим значением, обновляется в момент публикации, по вашему времени.",
      h1: "Экономический календарь форекс",
    },
    pairTitle: "Сигнал {pair} и анализ: вход, стоп-лосс, тейк-профит | 964FX",
    pairDescription: "Сигнал форекс {pair} и анализ онлайн: текущий сетап, вход, стоп-лосс и тейк-профит, шесть причин, график и закрытые сделки. Не является рекомендацией.",
    pairH1: "Сигнал и анализ {pair}",
  },
  fr: {
    signals: {
      title: "Signaux forex gratuits chaque jour avec stop loss et TP | 964FX",
      description: "Signaux forex gratuits chaque jour sur EUR/USD, GBP/USD et les autres majeures : entrée, stop loss, take profit et six raisons. Archive publique. Pas un conseil financier.",
      h1: "Signaux forex gratuits du jour",
    },
    calendar: {
      title: "Calendrier économique forex de la semaine en direct | 964FX",
      description: "Calendrier économique forex en direct : annonces à impact fort et moyen avec réel, prévision et précédent, mis à jour dès la publication, à votre heure locale.",
      h1: "Calendrier économique forex",
    },
    pairTitle: "Signal {pair} et analyse : entrée, stop loss, take profit | 964FX",
    pairDescription: "Signal forex {pair} et analyse en direct : configuration actuelle, entrée, stop loss et take profit, six raisons, graphique et résultats clôturés. Pas un conseil.",
    pairH1: "Signal forex {pair} et analyse",
  },
  de: {
    signals: {
      title: "Forex Signale kostenlos: täglich mit Stop-Loss und Ziel | 964FX",
      description: "Kostenlose Forex Signale jeden Tag für EUR/USD, GBP/USD und weitere Majors: Einstieg, Stop-Loss, Take-Profit und sechs Gründe. Öffentliches Archiv. Keine Anlageberatung.",
      h1: "Kostenlose Forex Signale – täglich",
    },
    calendar: {
      title: "Forex Wirtschaftskalender dieser Woche live | 964FX",
      description: "Forex-Wirtschaftskalender live: Termine mit hohem und mittlerem Impakt mit Ist, Prognose und Vorwert, sofort nach Veröffentlichung aktualisiert, in Ihrer Ortszeit.",
      h1: "Forex-Wirtschaftskalender",
    },
    pairTitle: "{pair} Forex Signal & Analyse: Einstieg, SL, TP | 964FX",
    pairDescription: "{pair} Forex Signal und Live-Analyse: aktuelles Setup, Einstieg, Stop-Loss und Take-Profit, sechs Gründe, Chart und geschlossene Ergebnisse. Keine Anlageberatung.",
    pairH1: "{pair} Forex Signal und Analyse",
  },
  es: {
    signals: {
      title: "Señales forex gratis cada día con stop loss y objetivo | 964FX",
      description: "Señales forex gratis cada día para EUR/USD, GBP/USD y los demás pares principales: entrada, stop loss, take profit y seis razones. Archivo público. No es asesoramiento.",
      h1: "Señales forex gratis cada día",
    },
    calendar: {
      title: "Calendario económico forex de la semana en vivo | 964FX",
      description: "Calendario económico forex en vivo: eventos de impacto alto y medio con dato real, previsión y anterior, actualizado al publicarse, en tu hora local.",
      h1: "Calendario económico forex",
    },
    pairTitle: "Señal {pair} y análisis: entrada, stop loss, take profit | 964FX",
    pairDescription: "Señal forex {pair} y análisis en vivo: setup actual, entrada, stop loss y take profit, seis razones, gráfico y resultados cerrados. No es asesoramiento.",
    pairH1: "Señal forex {pair} y análisis",
  },
};

export function seoCopy(lang: Lang) {
  return COPY[lang];
}

export function pairSlash(pair: string) {
  return pair.length === 6 ? `${pair.slice(0, 3)}/${pair.slice(3)}` : pair;
}

export function pairValues(lang: Lang, pair: string) {
  const local = COPY[lang]?.pairLocal?.[pair] ?? "";
  return { pair: pairSlash(pair), local };
}
