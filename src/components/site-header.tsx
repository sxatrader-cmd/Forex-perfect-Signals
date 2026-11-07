"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrokerLink } from "@/components/broker-link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/format";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { slug: "", key: "home" },
  { slug: "/signals", key: "signals" },
  { slug: "/news", key: "news" },
  { slug: "/archive", key: "archive" },
  { slug: "/method", key: "method" },
] as const;

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function withLang(path: string, lang: Lang) {
  const parts = normalize(path).split("/").filter(Boolean);
  if (parts[0] === "ar" || parts[0] === "en") parts[0] = lang;
  else parts.unshift(lang);
  return `/${parts.join("/")}`;
}

export function SiteHeader() {
  const pathname = normalize(usePathname() || "/");
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const start = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div dir="ltr" className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href={`/${lang}`} className="shrink-0" aria-label={t.brand}>
          <Logo />
        </Link>
        <div className="ms-auto flex min-w-0 items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t.brand}>
            {links.map((link) => {
              const href = `/${lang}${link.slug}`;
              const active = link.slug === "" ? pathname === `/${lang}` || pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={link.key}
                  href={href}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground",
                    active && "bg-muted text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <p className="nums hidden text-xs text-muted-foreground xl:block">
            <span className="me-1 text-primary">{t.clockLabel}</span>
            {now ? formatClock(now, lang) : "—"}
          </p>
          <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label={t.langLabel}>
            {(["ar", "en"] as const).map((code) => (
              <Link
                key={code}
                href={withLang(pathname, code)}
                hrefLang={code}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={lang === code ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                {code === "ar" ? "عربي" : "EN"}
              </Link>
            ))}
          </div>
          <BrokerLink className="hidden sm:inline-flex">{t.openAccount}</BrokerLink>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close" : "Menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-3 lg:hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                href={`/${lang}${link.slug}`}
                className="rounded-lg px-2 py-3 text-base hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>
          <BrokerLink className="mt-3 w-full">{t.openAccount}</BrokerLink>
        </div>
      ) : null}
    </header>
  );
}
