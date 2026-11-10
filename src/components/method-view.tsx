"use client";

import { faq } from "@/lib/faq";
import { useI18n } from "@/lib/i18n";
import { signalsData } from "@/lib/market-data";
import { BASE_PATH } from "@/lib/site";

const sections = {
  ar: [
    {
      title: "متى تُفتح الإشارة",
      body: "التشغيل الساعي يحدّث النقاط العائمة ويغلق الصفقة إذا لامس أعلى أو أدنى شمعة ساعية الهدف أو الإيقاف بعد الدخول. إذا لامست الشمعة نفسها الاثنين، يُحتسب الإيقاف أولاً لأن ترتيب المسار غير معروف. إصدار إشارة جديدة يتم مرة في يوم بغداد، في أول تشغيل ناجح من الساعة 05:00 بتوقيت UTC فما بعد، ولزوج ليس لديه إشارة مفتوحة ولم تُصدر له إشارة في اليوم نفسه.",
    },
    {
      title: "الاتجاه اليومي",
      body: "اتجاه الصفقة من إطار 4 ساعات: EMA20 فوق EMA50 مع هيستوغرام MACD موجب للشراء، والعكس للبيع. الميل اليومي يُستخدم مرشحاً: نترك الصفقة فقط إذا كان الاصطفاف اليومي معاكساً بالكامل والسعر في الجهة الخطأ من EMA200. فرق المتوسطات يُرفض فقط إذا كان الإطاران معاً شبه متلاصقين.",
    },
    {
      title: "توقيت الأربع ساعات",
      body: "يُسمح بالتصحيح نحو EMA20 على 4 ساعات ما دام السعر لم يخسر EMA50. الامتداد المقبول من −0.6 إلى 2.0 ضعف ATR. RSI للشراء بين 32 و72، وللبيع بين 28 و68. نبرة الأخبار تمنع الصفقة فقط عند تعارض قوي، ولا تُستخدم لإجبار إشارة.",
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
      body: "Direction comes from the 4-hour chart: EMA20 above EMA50 with a positive MACD histogram for a buy, and the reverse for a sell. Daily EMAs are a bias filter. A setup is dropped only when the daily stack fully opposes the 4-hour trend and price is on the wrong side of EMA200. A flat skip needs both timeframes stuck together.",
    },
    {
      title: "Four-hour timing",
      body: "A pullback toward the 4-hour EMA20 is allowed as long as price has not lost the 4-hour EMA50. Distance from that EMA20 can sit between −0.6 and 2.0 ATR. Buy RSI is 32–72. Sell RSI is 28–68. Headline tone blocks only a strong contradiction and never forces a trade.",
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
        <img
          src={`${BASE_PATH}/logo-square.webp`}
          alt="964FX"
          width={759}
          height={800}
          className="mb-6 w-full max-w-[200px]"
        />
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
