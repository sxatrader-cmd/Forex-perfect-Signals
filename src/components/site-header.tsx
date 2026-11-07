"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrokerLink } from "@/components/broker-link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" },
  { href: "/signals", key: "signals" },
  { href: "/news", key: "news" },
  { href: "/method", key: "method" },
] as const;

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function SiteHeader() {
  const pathname = normalize(usePathname() || "/");
  const { t, lang, setLang } = useI18n();
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="min-w-0 shrink" aria-label={t.brand}>
          <Logo />
        </Link>
        <nav className="ms-4 hidden items-center gap-1 md:flex" aria-label={t.brand}>
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t.nav[link.key]}
              </Link>
            );
          })}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <p className="nums hidden text-xs text-muted-foreground lg:block">
            <span className="me-1 text-primary">{t.clockLabel}</span>
            {now ? formatClock(now, lang) : "—"}
          </p>
          <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label={t.langLabel}>
            {(["ar", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={lang === code}
              >
                {code === "ar" ? "عربي" : "EN"}
              </button>
            ))}
          </div>
          <BrokerLink className="hidden sm:inline-flex">{t.openAccount}</BrokerLink>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close" : "Menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label={t.brand}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-2 py-3 text-base hover:bg-muted" onClick={() => setOpen(false)}>
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
