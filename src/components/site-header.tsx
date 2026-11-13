"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrokerLink } from "@/components/broker-link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/format";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { guideNav } from "@/lib/guides/nav";
import { showShellCta } from "@/lib/broker-cta";
import { LANG_META } from "@/lib/langs";
import { cn } from "@/lib/utils";

const links = [
  { slug: "", key: "home" },
  { slug: "/signals", key: "signals" },
  { slug: "/calendar", key: "news" },
  { slug: "/archive", key: "archive" },
  { slug: "/method", key: "method" },
] as const;

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function SiteHeader() {
  const pathname = normalize(usePathname() || "/");
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const guides = guideNav(lang);
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
        <Link href={`/${lang}/`} className="shrink-0" aria-label={t.brand}>
          <Logo />
        </Link>
        <div className="ms-auto flex min-w-0 items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t.brand}>
            {links.map((link) => {
              const href = `/${lang}${link.slug}/`;
              const bare = `/${lang}${link.slug}`;
              const active = link.slug === "" ? pathname === `/${lang}` || pathname === "/" : pathname === bare || pathname.startsWith(`${bare}/`);
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
            {guides ? (
              <Link
                href={`/${lang}/guides/`}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground",
                  pathname.startsWith(`/${lang}/guides`) && "bg-muted text-foreground",
                )}
              >
                {guides.nav}
              </Link>
            ) : null}
          </nav>
          <p className="nums hidden text-xs text-muted-foreground xl:block">
            <span className="me-1 text-primary">{t.clockLabel}</span>
            {now ? formatClock(now, lang) : "—"}
          </p>
          <LanguageSwitcher pathname={pathname} onNavigate={() => setOpen(false)} />
          {showShellCta(lang) ? <BrokerLink className="hidden sm:inline-flex">{t.openAccount}</BrokerLink> : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-label={open ? t.menuClose : t.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-3 lg:hidden" dir={LANG_META[lang].dir}>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                href={`/${lang}${link.slug}/`}
                className="rounded-lg px-2 py-3 text-base hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t.nav[link.key]}
              </Link>
            ))}
            {guides ? (
              <Link
                href={`/${lang}/guides/`}
                className="rounded-lg px-2 py-3 text-base hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {guides.nav}
              </Link>
            ) : null}
          </nav>
          {showShellCta(lang) ? <BrokerLink className="mt-3 w-full">{t.openAccount}</BrokerLink> : null}
        </div>
      ) : null}
    </header>
  );
}
