"use client";

import { useI18n } from "@/lib/i18n";

export function PriceWidget() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-fit max-w-full">
      <h2 className="text-center text-lg font-semibold">{t.livePrices}</h2>
      <p className="mt-1 text-center text-xs text-muted-foreground">{t.livePricesBy}</p>
      <div className="mt-3 flex justify-center">
        <iframe
          src="https://secure.ic.com//Partner/Widget/PriceWidget/8117"
          width={273}
          height={480}
          title={t.livePricesBy}
          loading="lazy"
          className="max-w-full border-0 bg-white"
        />
      </div>
    </section>
  );
}
