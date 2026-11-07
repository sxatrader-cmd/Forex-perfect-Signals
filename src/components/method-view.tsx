"use client";

import { faq } from "@/lib/faq";
import { useI18n } from "@/lib/i18n";
import { signalsData } from "@/lib/market-data";

const sections = {
  ar: [
    {
      title: "متى تُفتح الإشارة",
      body: "التشغيل الساعي يحدّث النقاط العائمة ويغلق الصفقة إذا لامس أعلى أو أدنى شمعة ساعية الهدف أو الإيقاف بعد الدخول. إذا لامست الشمعة نفسها الاثنين، يُحتسب الإيقاف أولاً لأن ترتيب المسار غير معروف. إصدار إشارة جديدة يتم مرة في يوم بغداد، في أول تشغيل ناجح من الساعة 05:00 بتوقيت UTC فما بعد، ولزوج ليس لديه إشارة مفتوحة ولم تُصدر له إشارة في اليوم نفسه.",
    },
    {
      title: "الاتجاه اليومي",
      body: "يجب أن يصطف EMA20 فوق EMA50 وفوق EMA200 للشراء، أو العكس للبيع. المسافة بين EMA20 وEMA50 لا تقل عن 0.08 من ATR اليومي. وآخر سعر يجب أن يبقى في جهة الاتجاه بالنسبة إلى EMA20 اليومي.",
    },
    {
      title: "توقيت الأربع ساعات",
      body: "السعر في جهة الاتجاه بالنسبة إلى EMA50 على 4 ساعات، وبعده عن EMA20 بين 0.15 و1.15 ضعف ATR حتى لا نلاحق امتداداً ولا ندخل ملتصقين بالمتوسط. RSI للشراء بين 45 و65، وللبيع بين 35 و55. هيستوغرام MACD يوافق الاتجاه.",
    },
    {
      title: "الإيقاف والهدف",
      body: "الإيقاف يوضع بعد أقرب تأرجح على 4 ساعات بهامش 0.15 ATR عندما تقع المسافة بين 0.9 و2.0 ATR، وإلا تُستخدم مضاعفات ATR. الهدف الافتراضي 1.7 ضعف المخاطرة، ويُقرَّب أمام المقاومة أو الدعم التالي إذا بقيت النسبة 1:1.5 على الأقل. أقل مسافة إيقاف نقبلها 8 نقاط. الأرقام لا تشمل السبريد.",
    },
    {
      title: "الخبر والعناوين",
      body: "لا إشارة جديدة إذا كان لعملة الزوج خبر عالي التأثير خلال 8 ساعات. مفاجأة التقويم هي الفرق بين الفعلي والتوقع بعد تصنيف مؤشرات البطالة كعكسية. مزاج العناوين يُجمع من خلاصات عامة، ويمنع الصفقة فقط إذا عارضها بوضوح (فرق 0.6 أو أكثر) مع عنوانين مُقيَّمين على الأقل لكل عملة. السوق المغلق لا يستقبل إشارة جديدة حتى لو اكتمل الفني.",
    },
    {
      title: "المصادر",
      body: "الأسعار من واجهة ياهو المالية (اليومية وساعة وأربع ساعات) مع خادم بديل. التقويم من ملف Forex Factory الأسبوعي. الفعلي يُطابق من TradingView لأن ملف Forex Factory لا يحوي هذه الخانة. العناوين تُجلب من ForexLive وInvesting.com وActionForex وFXStreet، وتُذكر الخلاصة التي نجحت والتي فشلت أسفل الصفحة.",
    },
  ],
  en: [
    {
      title: "When a signal is allowed",
      body: "Hourly runs update floating pips and close a trade if an hourly high or low after entry touches the target or the stop. If one candle touches both, the stop is counted first because the path inside the bar is unknown. A new signal is issued once per Baghdad day, on the first successful run at or after 05:00 UTC, and only for a pair with nothing open and nothing already issued that day.",
    },
    {
      title: "Daily trend",
      body: "EMA20 must sit above EMA50 and EMA200 for a buy, or the reverse for a sell. EMA20 and EMA50 must be at least 0.08 daily ATR apart. The latest price has to stay on the trend side of daily EMA20.",
    },
    {
      title: "Four-hour timing",
      body: "Price must be on the trend side of the 4H EMA50, and 0.15 to 1.15 ATR away from the 4H EMA20 so the entry is neither extended nor stuck to the average. Buy RSI is 45–65. Sell RSI is 35–55. The MACD histogram has to agree.",
    },
    {
      title: "Stop and target",
      body: "The stop sits beyond the nearest 4H swing by 0.15 ATR when that distance lands between 0.9 and 2.0 ATR. Otherwise it uses an ATR multiple. The default target is 1.7 times the risk, pulled in front of the next swing if reward stays at least 1.5 times risk. Stops closer than 8 pips are rejected. Distances ignore the spread.",
    },
    {
      title: "News and headlines",
      body: "No new signal if either currency has a high-impact release inside 8 hours. A calendar surprise is actual versus forecast, with unemployment-style releases treated as inverse. Headline tone comes from public RSS feeds and blocks a trade only when it clearly opposes it (an edge of 0.6 or more) and each currency has at least two scored headlines. A closed market does not receive a new signal even if the technical checks pass.",
    },
    {
      title: "Sources",
      body: "Prices come from the Yahoo Finance chart API (daily, 1h, and 4h) with a second host as fallback. The calendar is Forex Factory's public weekly file. Actuals are matched from TradingView because that file has no actual field. Headlines are requested from ForexLive, Investing.com, ActionForex, and FXStreet. The feeds that responded, and the ones that failed, are listed under this page.",
    },
  ],
};

export function MethodView() {
  const { t, lang } = useI18n();
  const failed = signalsData.sources.headlines.failed.map((item) => item.source).join(", ");
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-semibold text-primary">{t.ib}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.methodTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.methodLede}</p>
      </header>
      {sections[lang].map((section) => (
        <article key={section.title} className="rounded-2xl border border-border bg-card/70 p-5">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
        </article>
      ))}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{lang === "ar" ? "أسئلة" : "Questions"}</h2>
        {faq[lang].map((item) => (
          <article key={item.q} className="rounded-2xl border border-border bg-card/70 p-5">
            <h3 className="font-semibold">{item.q}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
          </article>
        ))}
      </section>
      <p className="text-xs leading-6 text-muted-foreground">
        {signalsData.sources.prices.detail} {failed ? `${t.failedFeeds}: ${failed}.` : ""}
      </p>
    </div>
  );
}
