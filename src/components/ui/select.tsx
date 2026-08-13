import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-md border border-border bg-elevated bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-sm text-fg outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239a978c' d='M1 1.5L6 6.5L11 1.5'/></svg>\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
