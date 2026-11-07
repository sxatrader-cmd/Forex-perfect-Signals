import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HREF = "https://www.ic.com/en/?camp=8117";

export function BrokerLink({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="sponsored noopener"
      className={cn(buttonVariants({ variant, size: "lg" }), "h-11 px-4", className)}
    >
      {children}
    </a>
  );
}
