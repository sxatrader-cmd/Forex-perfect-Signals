import { BASE_PATH } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  const src = `${BASE_PATH}/logo.svg`;
  return (
    <img
      src={src}
      alt="964FX"
      width={392}
      height={148}
      className={`block h-9 w-auto max-w-[54vw] sm:h-11 sm:max-w-[280px] md:max-w-none ${className}`}
    />
  );
}
