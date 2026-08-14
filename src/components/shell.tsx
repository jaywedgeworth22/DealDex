import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AccountMenu, GuestMenu } from "@/components/account-menu";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Skeleton className="size-9 rounded-full" />;
  return user ? (
    <AccountMenu />
  ) : (
    <div className="flex items-center">
      <GuestMenu />
      <Link
        to="/login"
        className="inline-flex h-11 items-center rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        Sign in
      </Link>
    </div>
  );
}

const PAGE = "mx-auto w-full min-w-0 max-w-7xl px-4";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh min-w-0 overflow-x-hidden bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/85 backdrop-blur-sm">
        <div className={cn(PAGE, "flex h-14 items-center justify-between gap-3")}>
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-sm border border-accent/40 font-display text-sm leading-none text-accent">
              Δ
            </span>
            <span className="font-display text-lg tracking-tight">DealDex</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
            <Link
              to="/"
              className="hidden h-11 items-center px-3 text-muted transition-colors duration-150 hover:text-fg sm:inline-flex"
            >
              Scan
            </Link>
            <Link
              to="/alerts"
              className="hidden h-11 items-center px-3 text-muted transition-colors duration-150 hover:text-fg sm:inline-flex"
            >
              Alerts
            </Link>
            <Link
              to="/saved"
              className="inline-flex h-11 items-center px-3 text-muted transition-colors duration-150 hover:text-fg"
            >
              Saved
            </Link>
            <Link
              to="/install"
              className="inline-flex h-11 items-center px-3 text-muted transition-colors duration-150 hover:text-fg"
            >
              Apps
            </Link>
            <Link
              to="/settings"
              className="hidden h-11 items-center px-3 text-muted transition-colors duration-150 hover:text-fg sm:inline-flex"
            >
              Settings
            </Link>
            <AuthSlot />
          </nav>
        </div>
      </header>
      <div className={cn(PAGE, "pb-16 pt-8 sm:pt-12")}>{children}</div>
      <footer className="border-t border-border/80">
        <div className={cn(PAGE, "flex flex-col gap-2 py-8 text-xs text-subtle sm:flex-row sm:items-start sm:justify-between sm:gap-8")}>
          <p>
            Values from TCGPlayer, Cardmarket, eBay solds, and PriceCharting.  Not affiliated with
            those markets or Pokémon.{" "}
            <Link to="/privacy" className="underline decoration-border underline-offset-2 hover:text-fg">
              Privacy
            </Link>
          </p>
          <p className="sm:max-w-sm sm:text-right">
            Grade multipliers are estimates. Confirm authenticity before you buy.
          </p>
        </div>
      </footer>
    </div>
  );
}
