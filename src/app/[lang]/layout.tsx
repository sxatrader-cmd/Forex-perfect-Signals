import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "ar" && lang !== "en") notFound();
  return <SiteShell lang={lang as Lang}>{children}</SiteShell>;
}
