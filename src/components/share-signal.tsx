"use client";

import { useState } from "react";
import { formatPrice, pairLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { fill } from "@/lib/langs";
import type { Signal } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export function signalUrl(lang: string, pair: string) {
  return `${SITE}/${lang}/signals/${pair.toLowerCase()}/`;
}

export function ShareSignal({ signal }: { signal: Signal }) {
  const { lang, t } = useI18n();
  const [done, setDone] = useState(false);
  const url = signalUrl(lang, signal.pair);
  const side = signal.direction === "BUY" ? (lang === "en" ? "BUY" : t.buy) : lang === "en" ? "SELL" : t.sell;
  const text = fill(t.shareText, {
    pair: pairLabel(signal.pair),
    side,
    entry: formatPrice(signal.pair, signal.entry),
    sl: formatPrice(signal.pair, signal.sl),
    tp: formatPrice(signal.pair, signal.tp),
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "964FX", text, url });
        return;
      } catch {
        return;
      }
    }
    copy();
  }

  const btn = "rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className={btn}>
        {done ? t.copied : t.copyLink}
      </button>
      <button type="button" onClick={share} className={btn}>
        {t.share}
      </button>
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
      >
        WhatsApp
      </a>
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
      >
        Telegram
      </a>
    </div>
  );
}
