"use client";

import { useI18n } from "@/lib/i18n";

const HREF = "https://ic.com/?camp=8117";
const BADGE = "https://promo.icmarkets.com/Logos/2026/400x110/cla_icblack_july2026_400x110.png";
const GIF = "https://promo.icmarkets.com/GIFs/2026/Indices-FSA-EN/cla_en_01_aug2026_336x280.gif";

export function PartnerBadge() {
  const { t } = useI18n();
  return (
    <a href={HREF} target="_blank" rel="sponsored noopener" className="inline-block max-w-full rounded-lg bg-white p-2">
      <img src={BADGE} width={400} height={110} alt={t.partnerBadge} className="h-auto w-full max-w-[400px]" />
    </a>
  );
}

export function SponsoredGif() {
  return (
    <aside className="mx-auto inline-block w-fit max-w-full text-center">
      <p className="mb-2 text-center text-[11px] text-muted-foreground">Sponsored / إعلان</p>
      <a href={HREF} target="_blank" rel="sponsored noopener" className="inline-block max-w-full">
        <img src={GIF} width={336} height={280} alt="IC Markets" className="mx-auto h-auto w-[336px] max-w-full" />
      </a>
    </aside>
  );
}
