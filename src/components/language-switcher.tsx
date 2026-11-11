"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { isLang, LANG_META, LANGS, type Lang } from "@/lib/langs";
import { cn } from "@/lib/utils";
import { hasGuides } from "@/lib/guides/nav";

/** Swap the language segment and keep the rest of the path. */
export function withLang(path: string, lang: Lang) {
  const parts = path.split("/").filter(Boolean);
  if (parts[0] && isLang(parts[0])) parts[0] = lang;
  else parts.unshift(lang);
  // Guides exist only in some languages; send the rest to their home page.
  if (parts[1] === "guides" && !hasGuides(lang)) return `/${lang}`;
  return `/${parts.join("/")}`;
}

export function LanguageSwitcher({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground hover:bg-muted"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t.langLabel}: ${LANG_META[lang].label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe className="size-4 text-primary" aria-hidden />
        <span lang={LANG_META[lang].tag} className="hidden max-w-[6rem] truncate sm:inline">
          {LANG_META[lang].label}
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div
          className="absolute end-0 top-full z-50 mt-2 max-h-[70vh] w-48 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl"
          role="menu"
          aria-label={t.langLabel}
        >
          {LANGS.map((code) => {
            const meta = LANG_META[code];
            const active = code === lang;
            return (
              <Link
                key={code}
                href={withLang(pathname, code)}
                hrefLang={meta.tag}
                lang={meta.tag}
                dir={meta.dir}
                role="menuitem"
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted",
                  active ? "text-primary" : "text-foreground",
                )}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                <span>{meta.label}</span>
                {active ? <Check className="size-4 shrink-0" aria-hidden /> : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
