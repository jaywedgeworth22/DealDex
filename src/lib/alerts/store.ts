import type { AlertHit, AlertRule } from "./types";

const RULES_KEY = "spreaddex:alerts";
const HITS_KEY = "spreaddex:alert-hits";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRules(): AlertRule[] {
  return readJson<AlertRule[]>(RULES_KEY, []);
}

export function saveRules(rules: AlertRule[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function loadHits(): AlertHit[] {
  return readJson<AlertHit[]>(HITS_KEY, []).slice(0, 80);
}

export function pushHits(hits: AlertHit[]) {
  if (!hits.length || typeof window === "undefined") return;
  const next = [...hits, ...loadHits()].slice(0, 80);
  window.localStorage.setItem(HITS_KEY, JSON.stringify(next));
}
