"use client";

import { faq } from "@/lib/faq";
import { useI18n } from "@/lib/i18n";
import { signalsData } from "@/lib/market-data";
import { BASE_PATH } from "@/lib/site";

const sections = {
  ar: [
    {
      title: "متى تُفتح الإشارة",
      body: "التشغيل يحدّث النقاط العائمة ويغلق الصفقة إذا لامس أعلى أو أدنى شمعة ساعية الهدف أو الإيقاف بعد الدخول. إذا لامست الشمعة نفسها الاثنين، يُحتسب الإيقاف أولاً لأن ترتيب المسار غير معروف. إصدار إشارة جديدة يتم مرة في يوم بغداد، في أول تشغيل ناجح من الساعة 08:00 بتوقيت UTC فما بعد، ولزوج ليس لديه إشارة مفتوحة ولم تُصدر له إشارة في اليوم نفسه. ما دام متغير PAUSE_ISSUE مساوياً 1 لا تُفتح إشارة جديدة، ويبقى تتبع الصفقات المفتوحة وتحديث الأخبار.",
    },
    {
      title: "الاتجاه اليومي",
      body: "اتجاه الصفقة من إطار 4 ساعات: EMA20 فوق EMA50 مع هيستوغرام MACD موجب للشراء، والعكس للبيع، وADX(14) لا يقل عن 18. نترك الصفقة إذا كان الاصطفاف اليومي معاكساً بالكامل والسعر في الجهة الخطأ من EMA200. فرق المتوسطات يُرفض فقط إذا كان الإطاران معاً شبه متلاصقين.",
    },
    {
      title: "توقيت الأربع ساعات",
      body: "يُسمح بالتصحيح نحو EMA20 على 4 ساعات ما دام السعر لم يخسر EMA50. الامتداد المقبول من −0.15 إلى 1.5 ضعف ATR. RSI للشراء بين 40 و65، وللبيع بين 35 و60. نبرة الأخبار تمنع الصفقة فقط عند تعارض قوي، ولا تُستخدم لإجبار إشارة.",
    },
    {
      title: "الإيقاف والهدف",
      body: "الإيقاف يوضع بعد أقرب تأرجح على 4 ساعات بهامش 0.15 ATR عندما تقع المسافة بين 1.0 و2.2 ATR، وإلا تُستخدم مضاعفات ATR. الهدف الافتراضي ضعفا المخاطرة، ويُقرَّب أمام المقاومة أو الدعم التالي إذا بقيت النسبة 1:1.5 على الأقل. أقل مسافة إيقاف نقبلها 12 نقطة. الأرقام المنشورة لا تشمل السبريد.",
    },
    {
      title: "الخبر والعناوين",
      body: "بعد اكتمال الفني يجب أن يرجح مجموع مفاجآت الأخبار عالية التأثير (الفعلي مقابل التوقع) خلال آخر 8 أيام تداول العملة المشتراة. فارق سعر السياسة وتغيره خلال 120 يوماً يُذكران في أسباب الإشارة، ولا يمنعان الصفقة: على عينة التدريب كان اشتراطهما معاً يقطع الإشارات دون أن يحسّن النتيجة. لا إشارة جديدة إذا كان لعملة الزوج خبر عالي التأثير خلال 8 ساعات. مؤشرات البطالة تُقرأ بعكس الإشارة. مزاج العناوين يمنع الصفقة فقط إذا عارضها بقوة (فرق 0.85 أو أكثر). السوق المغلق لا يستقبل إشارة جديدة.",
    },
    {
      title: "المصادر",
      body: "الأسعار من واجهة ياهو المالية (اليومية وساعة وأربع ساعات) مع خادم بديل. التقويم من ملف Forex Factory الأسبوعي. الفعلي يُطابق من TradingView لأن ملف Forex Factory لا يحوي هذه الخانة. العناوين تُجلب من ForexLive وInvesting.com وActionForex وFXStreet، وتُذكر الخلاصة التي نجحت والتي فشلت أسفل الصفحة.",
    },
  ],
  en: [
    {
      title: "When a signal is allowed",
      body: "Each run updates floating pips and closes a trade if an hourly high or low after entry touches the target or the stop. If one candle touches both, the stop is counted first because the path inside the bar is unknown. A new signal is issued once per Baghdad day, on the first successful run at or after 08:00 UTC, and only for a pair with nothing open and nothing already issued that day. While PAUSE_ISSUE is 1, no new signal is opened. Open trades and the calendar still update.",
    },
    {
      title: "Daily trend",
      body: "Direction comes from the 4-hour chart: EMA20 above EMA50 with a positive MACD histogram for a buy, and the reverse for a sell, and 4-hour ADX(14) at least 18. A setup is dropped when the daily stack fully opposes that trend and price is on the wrong side of EMA200. A flat skip needs both timeframes stuck together.",
    },
    {
      title: "Four-hour timing",
      body: "A pullback toward the 4-hour EMA20 is allowed as long as price has not lost the 4-hour EMA50. Distance from that EMA20 can sit between −0.15 and 1.5 ATR. Buy RSI is 40–65. Sell RSI is 35–60. Headline tone blocks only a strong contradiction and never forces a trade.",
    },
    {
      title: "Stop and target",
      body: "The stop sits beyond the nearest 4H swing by 0.15 ATR when that distance lands between 1.0 and 2.2 ATR. Otherwise it uses an ATR multiple. The default target is 2 times the risk, pulled in front of the next swing if reward stays at least 1.5 times risk. Stops closer than 12 pips are rejected. Published distances ignore the spread.",
    },
    {
      title: "News and headlines",
      body: "After the technical checks, the sum of high-impact surprises (actual versus forecast) over the last 8 trading days must favour the bought currency. The policy-rate gap and its 120-day change are cited in the reasons and do not block the trade: requiring them as well cut the training sample without improving it. No new signal if either currency has a high-impact release inside 8 hours. Unemployment-style releases are read in reverse. Headline tone blocks a trade only when it strongly opposes it (an edge of 0.85 or more) and each currency has at least two scored headlines. A closed market does not receive a new signal even if the other checks pass.",
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
