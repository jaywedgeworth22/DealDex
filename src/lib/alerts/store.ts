import { DEFAULT_AUTO_BUY, type AlertHit, type AlertRule, type AutoBuyConfig } from "./types";

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

function normalizeAutoBuy(value: unknown): AutoBuyConfig {
  if (!value || typeof value !== "object") return { ...DEFAULT_AUTO_BUY };
  const v = value as Partial<AutoBuyConfig>;
  return {
    enabled: Boolean(v.enabled),
    dryRun: v.dryRun !== false,
    maxPriceCents: Math.max(0, Math.round(Number(v.maxPriceCents ?? DEFAULT_AUTO_BUY.maxPriceCents))),
    minSpread: Math.max(0, Number(v.minSpread ?? DEFAULT_AUTO_BUY.minSpread)),
    maxMonthlyCents: Math.max(0, Math.round(Number(v.maxMonthlyCents ?? DEFAULT_AUTO_BUY.maxMonthlyCents))),
    maxDailyCents: Math.max(0, Math.round(Number(v.maxDailyCents ?? DEFAULT_AUTO_BUY.maxDailyCents))),
    coolHours: Math.max(0, Math.round(Number(v.coolHours ?? DEFAULT_AUTO_BUY.coolHours))),
    marketplace: "ebay",
  };
}

export function loadRules(): AlertRule[] {
  const raw = readJson<AlertRule[]>(RULES_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({ ...r, autoBuy: normalizeAutoBuy((r as { autoBuy?: unknown }).autoBuy) }));
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
