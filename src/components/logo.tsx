import { BASE_PATH } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  const src = `${BASE_PATH}/logo-header.webp`;
  return (
    <img
      src={src}
      alt="964FX"
      width={586}
      height={112}
      className={`block h-10 w-auto max-w-[62vw] sm:h-14 ${className}`}
    />
  );
}
