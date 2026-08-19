export type AppMarkId = "delta" | "peak" | "dd" | "disc";

export const MARK_KEY = "dealdex:mark";

export const APP_MARKS: { id: AppMarkId; label: string; blurb: string }[] = [
  { id: "delta", label: "Delta", blurb: "The square Δ we already use." },
  { id: "peak", label: "Peak", blurb: "The A / mountain from the favicon." },
  { id: "dd", label: "Wordmark", blurb: "Official DealDex title mark." },
  { id: "disc", label: "Disc", blurb: "Filled circle with a Δ." },
];

export function readAppMark(): AppMarkId {
  if (typeof window === "undefined") return "delta";
  try {
    const v = window.localStorage.getItem(MARK_KEY);
    if (v === "delta" || v === "peak" || v === "dd" || v === "disc") return v;
  } catch {
    /* ignore */
  }
  return "delta";
}

export function writeAppMark(id: AppMarkId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARK_KEY, id);
  } catch {
    /* ignore */
  }
}
