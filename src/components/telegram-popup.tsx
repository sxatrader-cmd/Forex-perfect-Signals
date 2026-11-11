"use client";

import { useEffect, useState } from "react";
import { LANG_META, type Lang } from "@/lib/langs";

const CHANNEL_URL = "https://t.me/Code964fx";
const STORAGE_KEY = "964fx-tg-popup";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 8000;

const COPY: Record<Lang, { title: string; body: string; cta: string; close: string }> = {
  ar: { title: "تابع توصياتنا على قناتنا في تيليجرام", body: "انضم الآن لتصلك كل توصية جديدة فور صدورها.", cta: "انضم إلى القناة", close: "إغلاق" },
  en: { title: "Follow our signals on Telegram", body: "Join our channel and get every new signal as soon as it's published.", cta: "Join the channel", close: "Close" },
  "zh-cn": { title: "在 Telegram 关注我们的信号", body: "加入我们的频道，新信号发布后第一时间收到通知。", cta: "加入频道", close: "关闭" },
  "zh-tw": { title: "在 Telegram 追蹤我們的訊號", body: "加入我們的頻道，新訊號發布後第一時間收到通知。", cta: "加入頻道", close: "關閉" },
  fr: { title: "Suivez nos signaux sur Telegram", body: "Rejoignez notre canal pour recevoir chaque nouveau signal dès sa publication.", cta: "Rejoindre le canal", close: "Fermer" },
  de: { title: "Folge unseren Signalen auf Telegram", body: "Tritt unserem Kanal bei und erhalte jedes neue Signal, sobald es veröffentlicht wird.", cta: "Kanal beitreten", close: "Schließen" },
  es: { title: "Sigue nuestras señales en Telegram", body: "Únete a nuestro canal y recibe cada señal nueva en cuanto se publique.", cta: "Unirme al canal", close: "Cerrar" },
  pt: { title: "Siga nossos sinais no Telegram", body: "Entre no nosso canal e receba cada sinal novo assim que for publicado.", cta: "Entrar no canal", close: "Fechar" },
  ru: { title: "Следите за нашими сигналами в Telegram", body: "Подпишитесь на канал и получайте каждый новый сигнал сразу после публикации.", cta: "Перейти в канал", close: "Закрыть" },
  hi: { title: "Telegram पर हमारे सिग्नल फ़ॉलो करें", body: "हमारे चैनल से जुड़ें और हर नया सिग्नल जारी होते ही पाएँ।", cta: "चैनल से जुड़ें", close: "बंद करें" },
  ta: { title: "Telegram-இல் எங்கள் சிக்னல்களைப் பின்தொடருங்கள்", body: "எங்கள் சேனலில் இணைந்து, ஒவ்வொரு புதிய சிக்னலையும் வெளியானவுடனே பெறுங்கள்.", cta: "சேனலில் இணைக", close: "மூடு" },
  tr: { title: "Sinyallerimizi Telegram'da takip edin", body: "Kanalımıza katılın, her yeni sinyali yayınlandığı anda alın.", cta: "Kanala katıl", close: "Kapat" },
  fa: { title: "سیگنال‌های ما را در تلگرام دنبال کنید", body: "به کانال ما بپیوندید تا هر سیگنال جدید را به محض انتشار دریافت کنید.", cta: "عضویت در کانال", close: "بستن" },
};

function snoozed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    return at > 0 && Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
}

function remember() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* storage unavailable: just hide for this page view */
  }
}

/** Client-only Telegram prompt: renders nothing on the server or before the delay. */
export function TelegramPopup({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (snoozed()) return;
    const id = window.setTimeout(() => {
      if (!snoozed()) setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;
  const t = COPY[lang] ?? COPY.en;
  const { tag, dir } = LANG_META[lang];
  const close = () => {
    remember();
    setOpen(false);
  };

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="tg-popup-title"
      lang={tag}
      dir={dir}
      data-nosnippet
      className="fixed inset-x-3 bottom-24 z-40 rounded-2xl bg-[#229ED9] p-4 text-white shadow-xl shadow-black/40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[340px]"
    >
      <button
        type="button"
        onClick={close}
        aria-label={t.close}
        title={t.close}
        className="absolute top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/15 end-2"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="flex items-start gap-3 pe-8">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="#fff" aria-hidden="true" className="mt-0.5 shrink-0">
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
        <div>
          <p id="tg-popup-title" className="text-base font-bold leading-snug">{t.title}</p>
          <p className="mt-1 text-sm leading-snug text-white/90">{t.body}</p>
        </div>
      </div>
      <a
        href={CHANNEL_URL}
        target="_blank"
        rel="noopener"
        onClick={close}
        className="mt-3 block rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-[#229ED9] hover:bg-white/90"
      >
        {t.cta}
      </a>
    </aside>
  );
}
