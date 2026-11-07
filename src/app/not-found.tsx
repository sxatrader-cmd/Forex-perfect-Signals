"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-start justify-center gap-4 px-4 py-20">
      <h1 className="text-3xl font-semibold">{t.notFoundTitle}</h1>
      <p className="text-sm leading-7 text-muted-foreground">{t.notFoundBody}</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}>
        {t.backHome}
      </Link>
    </div>
  );
}
