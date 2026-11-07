export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-8 shrink-0">
        <rect width="32" height="32" rx="8" className="fill-card" />
        <path d="M6 23h4.2V15H6zm7.4 0H17.6V8h-4.2zm7.4 0H25V12h-4.2z" className="fill-primary" />
        <circle cx="23.4" cy="8.2" r="1.7" className="fill-foreground" />
      </svg>
      <span className="wordmark text-[0.95rem] leading-none font-semibold text-foreground sm:text-base">
        Forex Perfect Signal
      </span>
    </span>
  );
}
