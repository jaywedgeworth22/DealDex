import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, KeyRound, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function AccountMenu() {
  const user = useCurrentUser();
  const { pref, setPref } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const label = user?.displayName ?? user?.primaryEmail ?? "Account";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-full"
      >
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={label}
            className="size-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-elevated text-sm font-medium">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-lg bg-surface py-2 shadow-[var(--shadow-border)]"
        >
          <div className="border-b border-border px-3 pb-2">
            <p className="truncate text-sm font-medium">{label}</p>
            {user.primaryEmail && (
              <p className="truncate text-xs text-subtle">{user.primaryEmail}</p>
            )}
          </div>
          <p className="px-3 pt-2 text-[11px] uppercase tracking-[0.14em] text-subtle">Appearance</p>
          <div className="mt-1 px-2">
            {THEMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPref(t.id)}
                  className={cn(
                    "flex h-10 w-full items-center gap-2 rounded-md px-2 text-sm",
                    pref === t.id ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="mt-1 border-t border-border px-2 pt-1">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2 rounded-md px-2 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <KeyRound className="size-4" /> API desks
            </Link>
            <Link
              to="/alerts"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2 rounded-md px-2 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <Bell className="size-4" /> Alerts
            </Link>
            <Link
              to="/install"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2 rounded-md px-2 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <Smartphone className="size-4" /> iOS & Android app
            </Link>
            {authEnabled && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex h-10 w-full items-center rounded-md px-2 text-sm text-muted hover:bg-elevated hover:text-fg"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GuestMenu() {
  const { pref, setPref } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="Appearance"
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center text-muted hover:text-fg"
      >
        {pref === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-lg bg-surface py-1 shadow-[var(--shadow-border)]">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setPref(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-10 w-full items-center gap-2 px-3 text-sm",
                  pref === t.id ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-2 px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
          >
            API desks
          </Link>
        </div>
      )}
    </div>
  );
}
