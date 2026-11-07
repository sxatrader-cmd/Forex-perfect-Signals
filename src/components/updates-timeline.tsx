"use client";

import { formatPips, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { SignalUpdate } from "@/lib/types";

export function UpdatesTimeline({ updates, pair }: { updates: SignalUpdate[]; pair: string }) {
  const { t, lang } = useI18n();
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t.updatesTitle}</h3>
      {updates.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">{t.updatesEmpty}</p>
      ) : (
        <ol className="space-y-2 border-s border-primary/40 ps-3">
          {updates.map((update) => (
            <li key={update.at} className="text-sm leading-6">
              <p className="nums text-xs text-primary">
                {update.baghdad} · {formatPrice(pair, update.price)} · {formatPips(update.floatingPips)} {t.pips}
              </p>
              <p className="nums text-xs text-muted-foreground">
                {update.progressToTp}% {t.toTarget} · {update.distanceToSlPips} {t.pips} {t.fromStop}
              </p>
              <p>{lang === "ar" ? update.comment.ar : update.comment.en}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
