import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AccountMenu, GuestMenu } from "@/components/account-menu";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";

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

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh min-w-0 overflow-x-hidden bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-sm border border-accent/40 font-display text-sm leading-none text-accent">
              Δ
            </span>
            <span className="font-display text-lg tracking-tight">DealDex</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
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
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-8 sm:pt-12">{children}</div>
      <footer className="border-t border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            Values from TCGPlayer, Cardmarket, eBay solds, and PriceCharting. Not affiliated with
            those markets or Pokémon.
          </p>
          <p>Grade multipliers are estimates. Confirm authenticity before you buy.</p>
        </div>
      </footer>
    </div>
  );
}
