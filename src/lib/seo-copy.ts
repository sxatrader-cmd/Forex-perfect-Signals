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
  pt: {
    signals: {
      title: "Sinais forex grátis hoje: entrada, stop loss e alvo | 964FX",
      description: "Sinais forex grátis todo dia para EUR/USD, GBP/USD e outros pares principais, com entrada, stop loss, take profit e seis motivos. Arquivo público. Conteúdo educacional.",
      h1: "Sinais forex grátis do dia",
    },
    calendar: {
      title: "Calendário econômico forex hoje, ao vivo no seu horário | 964FX",
      description: "Calendário econômico forex ao vivo: eventos de alto e médio impacto dos EUA e do mundo com atual, previsão e anterior, atualizado na divulgação, no seu horário local.",
      h1: "Calendário econômico forex",
    },
    pairTitle: "Sinal {pair} e análise hoje: entrada, stop e alvo | 964FX",
    pairDescription: "Sinal forex {pair} e análise ao vivo: setup atual, entrada, stop loss e take profit, seis motivos, gráfico e resultados fechados. Educacional, não é recomendação.",
    pairH1: "Sinal forex {pair} e análise",
  },
  tr: {
    signals: {
      title: "Forex sinyalleri bugün: ücretsiz, stop ve hedefli | 964FX",
      description: "Ücretsiz günlük forex (foreks) sinyalleri: EUR/USD, GBP/USD ve diğer majörler için giriş, stop loss, take profit ve altı gerekçe. Herkese açık arşiv. Yatırım tavsiyesi değildir.",
      h1: "Ücretsiz günlük forex sinyalleri",
    },
    calendar: {
      title: "Ekonomik takvim forex: bu haftanın verileri canlı | 964FX",
      description: "Canlı forex ekonomik takvimi: yüksek ve orta etkili veriler, gerçekleşen, beklenti ve önceki değerle, açıklandığı anda güncellenir, Türkiye saatiyle ya da yerel saatinizle.",
      h1: "Forex ekonomik takvim",
    },
    pairTitle: "{pair} forex sinyali ve analiz: giriş, stop, hedef | 964FX",
    pairDescription: "{pair} forex sinyali ve canlı analiz: güncel kurulum, giriş, stop loss ve take profit, altı gerekçe, grafik ve kapanmış sonuçlar. Eğitim amaçlıdır, tavsiye değildir.",
    pairH1: "{pair} forex sinyali ve analizi",
  },
  "zh-cn": {
    signals: {
      title: "今日外汇信号：免费每日外汇交易信号（含止损止盈）| 964FX",
      description: "免费每日外汇信号：EUR/USD、GBP/USD 等主要货币对，每条含入场价、止损、止盈和六个理由，历史信号公开可查。仅供学习，不构成投资建议。",
      h1: "免费每日外汇信号",
    },
    calendar: {
      title: "外汇财经日历：本周经济数据实时更新（北京时间）| 964FX",
      description: "外汇财经日历实时更新：高、中影响经济数据的公布值、预期值和前值，数据公布即刻刷新，按你的本地时间显示，含非农、CPI 和美联储决议。",
      h1: "外汇财经日历",
    },
    pairTitle: "{name}与{pair}行情分析：入场、止损、止盈 | 964FX",
    pairDescription: "{pair} 外汇信号与实时分析：当前形态、入场价、止损和止盈、六个理由、走势图和已平仓结果。仅供学习，不构成投资建议。",
    pairH1: "{pair} 外汇信号与行情分析",
  },
  "zh-tw": {
    signals: {
      title: "今日外匯訊號：免費每日外匯交易訊號（含停損停利）| 964FX",
      description: "免費每日外匯訊號：EUR/USD、GBP/USD 等主要貨幣對，每則含進場價、停損、停利與六個理由，歷史訊號公開可查。僅供教學，非投資建議。",
      h1: "免費每日外匯訊號",
    },
    calendar: {
      title: "外匯經濟日曆：本週經濟數據即時更新（台灣時間）| 964FX",
      description: "外匯經濟日曆即時更新：高、中影響經濟數據的公布值、預期值與前值，數據公布即刻刷新，依你的當地時間顯示，含非農、CPI 與聯準會決策。",
      h1: "外匯經濟日曆",
    },
    pairTitle: "{pair} 外匯訊號與分析：進場、停損、停利 | 964FX",
    pairDescription: "{pair} 外匯訊號與即時分析：目前型態、進場價、停損與停利、六個理由、走勢圖與已平倉結果。僅供教學，非投資建議。",
    pairH1: "{pair} 外匯訊號與分析",
  },
  hi: {
    signals: {
      title: "आज के फॉरेक्स सिग्नल: फ्री डेली सिग्नल, SL और TP के साथ | 964FX",
      description: "फ्री डेली फॉरेक्स सिग्नल हिंदी में: EUR/USD, GBP/USD और दूसरे मेजर पेयर, एंट्री, स्टॉप लॉस, टेक प्रॉफ़िट और छह कारणों के साथ। सार्वजनिक आर्काइव। सिर्फ़ शिक्षा के लिए।",
      h1: "फ्री डेली फॉरेक्स सिग्नल",
    },
    calendar: {
      title: "फॉरेक्स इकोनॉमिक कैलेंडर: इस हफ़्ते के डेटा लाइव (IST) | 964FX",
      description: "लाइव फॉरेक्स इकोनॉमिक कैलेंडर: हाई और मीडियम इम्पैक्ट इवेंट, एक्चुअल, फ़ोरकास्ट और पिछला आँकड़ा, जारी होते ही अपडेट, आपके लोकल टाइम (IST) में।",
      h1: "फॉरेक्स इकोनॉमिक कैलेंडर",
    },
    pairTitle: "{pair} फॉरेक्स सिग्नल और एनालिसिस: एंट्री, SL, TP | 964FX",
    pairDescription: "{pair} फॉरेक्स सिग्नल और लाइव एनालिसिस: मौजूदा सेटअप, एंट्री, स्टॉप लॉस और टेक प्रॉफ़िट, छह कारण, चार्ट और बंद नतीजे। शिक्षा के लिए, सलाह नहीं।",
    pairH1: "{pair} फॉरेक्स सिग्नल और एनालिसिस",
  },
  ta: {
    signals: {
      title: "இன்றைய forex signals தமிழில்: இலவச தினசரி signals | 964FX",
      description: "இலவச தினசரி forex signals தமிழில்: EUR/USD, GBP/USD மற்றும் முக்கிய ஜோடிகளுக்கு entry, stop loss, take profit, ஆறு காரணங்கள். பொது archive. கல்விக்காக மட்டும்.",
      h1: "இலவச தினசரி forex signals",
    },
    calendar: {
      title: "Forex பொருளாதார நாட்காட்டி: இந்த வார தரவுகள் நேரடியாக | 964FX",
      description: "நேரடி forex பொருளாதார நாட்காட்டி: அதிக மற்றும் நடுத்தர தாக்க நிகழ்வுகள், actual, forecast, previous மதிப்புகளுடன், உங்கள் உள்ளூர் நேரத்தில் (இலங்கை, மலேசியா, சிங்கப்பூர்).",
      h1: "Forex பொருளாதார நாட்காட்டி",
    },
    pairTitle: "{pair} forex signal மற்றும் பகுப்பாய்வு தமிழில் | 964FX",
    pairDescription: "{pair} forex signal மற்றும் நேரடி பகுப்பாய்வு: தற்போதைய setup, entry, stop loss, take profit, ஆறு காரணங்கள், சார்ட், மூடிய முடிவுகள். கல்விக்காக, ஆலோசனை அல்ல.",
    pairH1: "{pair} forex signal மற்றும் பகுப்பாய்வு",
  },
  fa: {
    signals: {
      title: "سیگنال فارکس امروز رایگان با حد ضرر و حد سود | 964FX",
      description: "سیگنال فارکس رایگان روزانه برای EUR/USD، GBP/USD و دیگر جفت‌ارزهای اصلی، با نقطه ورود، حد ضرر، حد سود و شش دلیل. آرشیو عمومی. آموزشی، نه توصیه مالی.",
      h1: "سیگنال فارکس رایگان روزانه",
    },
    calendar: {
      title: "تقویم اقتصادی فارکس امروز و این هفته به‌صورت زنده | 964FX",
      description: "تقویم اقتصادی فارکس زنده: خبرهای پراهمیت و متوسط با مقدار واقعی، پیش‌بینی و قبلی، به‌روزرسانی لحظه انتشار، به وقت محلی شما.",
      h1: "تقویم اقتصادی فارکس",
    },
    pairTitle: "سیگنال {pair} و تحلیل امروز: ورود، حد ضرر، حد سود | 964FX",
    pairDescription: "سیگنال فارکس {pair} و تحلیل زنده: ستاپ فعلی، نقطه ورود، حد ضرر و حد سود، شش دلیل، نمودار و نتایج بسته‌شده. آموزشی، نه توصیه.",
    pairH1: "سیگنال و تحلیل {pair}",
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
