import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { readAppMark, writeAppMark, type AppMarkId } from "@/lib/settings/mark";

export function AppMark({
  id = "delta",
  className,
}: {
  id?: AppMarkId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center overflow-hidden rounded-sm border border-accent/40 text-accent",
        className,
      )}
      aria-hidden
    >
      {id === "peak" ? (
        <PeakIcon />
      ) : id === "dd" ? (
        <span className="font-display text-xs leading-none tracking-tight">DD</span>
      ) : id === "disc" ? (
        <DiscIcon />
      ) : (
        <span className="font-display text-sm leading-none">Δ</span>
      )}
    </span>
  );
}

function PeakIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
      <path
        d="M3.2 12.2 8 4.2l4.8 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M5.6 9.4h4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DiscIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="currentColor" />
      <path
        d="M5.2 10.4 8 5.8l2.8 4.6"
        fill="none"
        stroke="var(--color-bg)"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MarkCtx = createContext<{
  mark: AppMarkId;
  setMark: (id: AppMarkId) => void;
}>({ mark: "delta", setMark: () => undefined });

export function MarkProvider({ children }: { children: ReactNode }) {
  const [mark, setMarkState] = useState<AppMarkId>("delta");
  useEffect(() => {
    setMarkState(readAppMark());
  }, []);
  const setMark = useCallback((id: AppMarkId) => {
    setMarkState(id);
    writeAppMark(id);
  }, []);
  const value = useMemo(() => ({ mark, setMark }), [mark, setMark]);
  return <MarkCtx.Provider value={value}>{children}</MarkCtx.Provider>;
}

export function useAppMark() {
  return useContext(MarkCtx);
}
