import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** Three-way Light / Dark / System control (icon + word on each segment). */
export function AppearanceToggle() {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="grid grid-cols-3 gap-2"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const on = pref === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setPref(opt.id)}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border text-xs font-medium sm:h-11 sm:flex-row sm:gap-2 sm:text-sm",
              on
                ? "border-fg bg-elevated text-fg"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
