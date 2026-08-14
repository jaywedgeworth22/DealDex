import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Intro copy. Same width as the cards — no extra skinny column. */
export function Lead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-3 text-muted", className)}>{children}</p>;
}
