import { fetchJina } from "@/lib/marketplaces/jina";
import { parseMoney } from "@/lib/marketplaces/html";
import type { DeskKeys } from "@/lib/settings/keys";
import { gradeMultiplier } from "./appraise";
import { fetchKeyedQuotes } from "./paid-sources";
import type { Confidence, Grade, TcgCard } from "./types";

export type QuoteFamily = "listed" | "sold" | "retail" | "model";

export type ValuationQuote = {
  source: string;
  label: string;
  usd: number | null;
  note: string;
  url?: string;
  family: QuoteFamily;
  weight: number;
};

export type ValuationBook = {
  quotes: ValuationQuote[];
  blend: number | null;
  conservative: number | null;
  fxEurUsd: number | null;
  confidence: Confidence;
  sourcesUsed: number;
  conflict: boolean;
  relSpread: number | null;
  note: string;
  conflictDetail: string | null;
};

const fxCache: { at: number; rate: number | null } = { at: 0, rate: null };

export async function eurUsd(): Promise<number | null> {
  if (fxCache.rate != null && Date.now() - fxCache.at < 12 * 60 * 60 * 1000) return fxCache.rate;
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD");
    const json = (await res.json()) as { rates?: { USD?: number } };
    const rate = json.rates?.USD ?? null;
    fxCache.at = Date.now();
    fxCache.rate = rate;
    return rate;
  } catch {
    return fxCache.rate;
  }
}

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export function iqrTrim(nums: number[]): number[] {
  if (nums.length < 4) return [...nums];
  const s = [...nums].sort((a, b) => a - b);
  const q1 = s[Math.floor((s.length - 1) * 0.25)]!;
  const q3 = s[Math.floor((s.length - 1) * 0.75)]!;
  const iqr = q3 - q1;
  if (iqr <= 0) return s;
  return s.filter((n) => n >= q1 - 1.5 * iqr && n <= q3 + 1.5 * iqr);
}

function parseSoldPrices(md: string, hint?: number | null): number[] {
  const out: number[] = [];
  for (const m of md.matchAll(/\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{2})?)/g)) {
    const n = parseMoney(m[1]);
    if (n == null || n < 2 || n >= 250000) continue;
    if (hint != null && hint > 8) {
      if (n < hint * 0.22 || n > hint * 3.8) continue;
    } else if (n < 8) {
      continue;
    }
    out.push(n);
  }
  return out.slice(0, 36);
}

export function soldStats(prices: number[]): { median: number | null; n: number } {
  const trimmed = iqrTrim(prices.filter((n) => n < 50000));
  return { median: median(trimmed.slice(0, 16)), n: trimmed.length };
}

export async function fetchEbaySoldMedian(card: TcgCard, grade: Grade): Promise<number | null> {
  const hint = card.finishes.find((f) => f.market != null)?.market ?? null;
  const q = encodeURIComponent(
    `${card.name} ${card.setName} ${card.localId}${grade === "raw" ? "" : ` ${grade}`}`,
  );
  const url = `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=25`;
  const md = await fetchJina(url);
  return soldStats(parseSoldPrices(md, hint)).median;
}

export async function fetchEbayActiveMedian(card: TcgCard, grade: Grade): Promise<number | null> {
  const hint = card.finishes.find((f) => f.market != null)?.market ?? null;
  const q = encodeURIComponent(
    `${card.name} ${card.setName} ${card.localId}${grade === "raw" ? "" : ` ${grade}`}`,
  );
  const url = `https://www.ebay.com/sch/183454/i.html?_nkw=${q}&LH_BIN=1&_sop=15&_ipg=25&_udlo=3`;
  const md = await fetchJina(url);
  return soldStats(parseSoldPrices(md, hint)).median;
}

export async function fetchPriceCharting(card: TcgCard): Promise<{
  ungraded: number | null;
  psa10: number | null;
  psa9: number | null;
  url: string;
}> {
  const q = encodeURIComponent(`${card.name} ${card.setName} pokemon`);
  const url = `https://www.pricecharting.com/search-products?type=prices&q=${q}`;
  const md = await fetchJina(url);
  const ungraded =
    parseMoney(md.match(/Ungraded[^$]{0,40}\$([0-9,]+\.?\d*)/i)?.[1]) ??
    parseMoney(md.match(/loose[^$]{0,20}\$([0-9,]+\.?\d*)/i)?.[1]);
  const psa10 = parseMoney(md.match(/PSA\s*10[^$]{0,40}\$([0-9,]+\.?\d*)/i)?.[1]);
  const psa9 = parseMoney(md.match(/PSA\s*9[^$]{0,40}\$([0-9,]+\.?\d*)/i)?.[1]);
  const href = md.match(/https:\/\/www\.pricecharting\.com\/game\/[^)\s]+/)?.[0] ?? url;
  return { ungraded, psa10, psa9, url: href };
}

type CsvGroup = { groupId: number; name: string };
type CsvPrice = {
  productId: number;
  marketPrice?: number | null;
  lowPrice?: number | null;
  midPrice?: number | null;
  subTypeName?: string;
};

const groupsCache: { at: number; rows: CsvGroup[] } = { at: 0, rows: [] };
const priceCache = new Map<number, { at: number; rows: CsvPrice[] }>();

async function tcgcsvGroups(): Promise<CsvGroup[]> {
  if (groupsCache.rows.length && Date.now() - groupsCache.at < 12 * 60 * 60 * 1000) {
    return groupsCache.rows;
  }
  const res = await fetch("https://tcgcsv.com/tcgplayer/3/groups", {
    headers: { Accept: "application/json", "User-Agent": "DealDex/1.0" },
  });
  if (!res.ok) return groupsCache.rows;
  const json = (await res.json()) as { results?: CsvGroup[] };
  groupsCache.at = Date.now();
  groupsCache.rows = json.results ?? [];
  return groupsCache.rows;
}

function matchGroup(groups: CsvGroup[], setName: string): CsvGroup | null {
  const n = setName.toLowerCase().replace(/^sv\d+[.:]\s*/i, "").replace(/^swsh\d+[.:]\s*/i, "").trim();
  const exact = groups.find((g) => g.name.toLowerCase() === n || g.name.toLowerCase() === setName.toLowerCase());
  if (exact) return exact;
  const stripped = groups.find((g) => {
    const gn = g.name.toLowerCase().replace(/^[^:]+:\s*/, "");
    return gn === n || gn.includes(n) || n.includes(gn);
  });
  return stripped ?? null;
}

export async function fetchTcgcsv(card: TcgCard): Promise<{
  market: number | null;
  low: number | null;
  mid: number | null;
  url?: string;
} | null> {
  try {
    const groups = await tcgcsvGroups();
    const group = matchGroup(groups, card.setName);
    if (!group) return null;
    let hit = priceCache.get(group.groupId);
    if (!hit || Date.now() - hit.at > 6 * 60 * 60 * 1000) {
      const res = await fetch(`https://tcgcsv.com/tcgplayer/3/${group.groupId}/prices`, {
        headers: { Accept: "application/json", "User-Agent": "DealDex/1.0" },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { results?: CsvPrice[] };
      hit = { at: Date.now(), rows: json.results ?? [] };
      priceCache.set(group.groupId, hit);
    }
    const pid = card.finishes.find((f) => f.productId != null)?.productId;
    const row = pid != null ? hit.rows.find((p) => p.productId === pid) : null;
    if (!row) return { market: null, low: null, mid: null };
    return {
      market: row.marketPrice ?? null,
      low: row.lowPrice ?? null,
      mid: row.midPrice ?? null,
      url: `https://www.tcgplayer.com/product/${row.productId}`,
    };
  } catch {
    return null;
  }
}

function usd(eur: number | null | undefined, fx: number | null): number | null {
  if (eur == null || fx == null || !Number.isFinite(eur)) return null;
  return eur * fx;
}

export function onHandQuotes(card: TcgCard, fx: number | null): ValuationQuote[] {
  const finish = card.finishes.find((f) => f.market != null) ?? card.finishes[0] ?? null;
  const cmNote = fx ? `Frankfurter EUR→USD ${fx.toFixed(3)}` : "Need FX for USD";
  return [
    {
      source: "tcgplayer",
      label: "TCGPlayer market",
      usd: finish?.market ?? null,
      note: finish?.label ?? "NM raw snapshot via TCGDex",
      family: "listed",
      weight: 0.18,
    },
    {
      source: "tcgplayer-low",
      label: "TCGPlayer low",
      usd: finish?.low ?? null,
      note: "Listed floor — a floor, not a fair value",
      family: "listed",
      weight: 0,
    },
    {
      source: "tcgplayer-mid",
      label: "TCGPlayer mid",
      usd: finish?.mid ?? null,
      note: "Mid of active TCGPlayer listings",
      family: "listed",
      weight: 0.06,
    },
    {
      source: "tcgplayer-high",
      label: "TCGPlayer high",
      usd: finish?.high ?? null,
      note: "Highest live TCGPlayer ask (often noise)",
      family: "listed",
      weight: 0,
    },
    {
      source: "tcgplayer-direct",
      label: "TCGPlayer direct low",
      usd: finish?.directLow ?? null,
      note: "Direct inventory floor",
      family: "retail",
      weight: 0.04,
    },
    {
      source: "cardmarket",
      label: "Cardmarket trend",
      usd: usd(card.cardmarketEur, fx),
      note: card.cardmarketEur != null ? `€${card.cardmarketEur.toFixed(2)} · ${cmNote}` : "EU trend via TCGDex",
      family: "listed",
      weight: 0.08,
    },
    {
      source: "cardmarket-1d",
      label: "Cardmarket 1-day avg",
      usd: usd(card.cardmarketAvg1, fx),
      note: "Yesterday’s EU prints",
      family: "sold",
      weight: 0.05,
    },
    {
      source: "cardmarket-7d",
      label: "Cardmarket 7-day avg",
      usd: usd(card.cardmarketAvg7, fx),
      note: "Dealers lean on 7-day more than a single trend tick",
      family: "sold",
      weight: 0.14,
    },
    {
      source: "cardmarket-30d",
      label: "Cardmarket 30-day avg",
      usd: usd(card.cardmarketAvg30, fx),
      note: "Slower EU mean — flags spikes",
      family: "sold",
      weight: 0.05,
    },
    {
      source: "cardmarket-low",
      label: "Cardmarket low",
      usd: usd(card.cardmarketLow, fx),
      note: "EU listed floor",
      family: "listed",
      weight: 0,
    },
  ];
}

export function scoreBook(quotes: ValuationQuote[]): Pick<
  ValuationBook,
  "blend" | "conservative" | "confidence" | "sourcesUsed" | "conflict" | "relSpread" | "note" | "conflictDetail"
> {
  const seeded = quotes.filter(
    (q) =>
      q.usd != null &&
      q.usd > 0 &&
      (q.source === "tcgplayer" ||
        q.source === "cardmarket-7d" ||
        q.source === "cardmarket" ||
        q.source === "tcgcsv" ||
        q.source === "justtcg" ||
        q.source === "pricecharting-api"),
  );
  const seedMed = median(seeded.map((q) => q.usd!));
  const core = quotes.filter((q) => {
    if (q.usd == null || q.usd <= 0 || q.weight <= 0) return false;
    if (seedMed != null && (q.usd < seedMed * 0.35 || q.usd > seedMed * 2.8)) return false;
    return true;
  });
  const sourcesUsed = core.length;
  let wsum = 0;
  let acc = 0;
  for (const q of core) {
    acc += q.usd! * q.weight;
    wsum += q.weight;
  }
  const blend = wsum > 0 ? acc / wsum : median(seeded.map((q) => q.usd!));
  const ranked = [...core].sort((a, b) => a.usd! - b.usd!);
  const loQ = ranked[0];
  const hiQ = ranked[ranked.length - 1];
  const lo = loQ?.usd ?? null;
  const hi = hiQ?.usd ?? null;
  const conflict = lo != null && hi != null && hi / lo > 1.35;
  const p20 = ranked[Math.floor((ranked.length - 1) * 0.2)]?.usd ?? lo;
  const p80 = ranked[Math.floor((ranked.length - 1) * 0.8)]?.usd ?? hi;
  const relSpread = blend && p20 != null && p80 != null ? (p80 - p20) / blend : null;
  let confidence: Confidence = "low";
  if (sourcesUsed >= 4 && (relSpread ?? 1) < 0.22) confidence = "high";
  else if (sourcesUsed >= 3 && (relSpread ?? 1) < 0.4) confidence = "medium";
  else if (sourcesUsed >= 2 && (relSpread ?? 1) < 0.25) confidence = "medium";
  const conservative = p20 != null && blend != null ? Math.min(p20, blend) : blend;
  const conflictDetail =
    conflict && loQ && hiQ
      ? `${loQ.label} $${loQ.usd!.toFixed(0)} vs ${hiQ.label} $${hiQ.usd!.toFixed(0)} (${Math.round((hi! / lo! - 1) * 100)}% apart)`
      : null;
  let note = "Need two independent desks before a steal.";
  if (sourcesUsed <= 1) note = "Single desk — treat any steal as unverified.";
  else if (conflict && conflictDetail) {
    note = `Desks differ: ${conflictDetail}. Common on vintage US vs EU. We score against the lower cluster, not the highest ask.`;
  } else if (confidence === "high") note = `${sourcesUsed} desks agree within ~${Math.round((relSpread ?? 0) * 100)}%.`;
  else note = `${sourcesUsed} desks in the book. Spread across sources is ${relSpread != null ? `${Math.round(relSpread * 100)}%` : "wide"}.`;
  return { blend, conservative, confidence, sourcesUsed, conflict, relSpread, note, conflictDetail };
}

export async function buildValuationBook(
  card: TcgCard,
  grade: Grade = "raw",
  keys: DeskKeys = {},
): Promise<ValuationBook> {
  const finish = card.finishes.find((f) => f.market != null) ?? card.finishes[0] ?? null;
  const market = finish?.market ?? null;
  const [fx, sold, active, chart, csv, keyed] = await Promise.all([
    eurUsd(),
    fetchEbaySoldMedian(card, grade).catch(() => null),
    fetchEbayActiveMedian(card, grade).catch(() => null),
    fetchPriceCharting(card).catch(() => ({ ungraded: null, psa10: null, psa9: null, url: "" })),
    fetchTcgcsv(card).catch(() => null),
    fetchKeyedQuotes(card, keys).catch(() => [] as ValuationQuote[]),
  ]);

  const psa10 = market != null ? market * gradeMultiplier(card, "PSA 10") : null;
  const soldUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${card.name} ${card.setName} ${card.localId}`)}&LH_Sold=1&LH_Complete=1`;
  const hasPcApi = keyed.some((q) => q.source === "pricecharting-api" && q.usd != null);

  const quotes: ValuationQuote[] = [
    ...onHandQuotes(card, fx),
    {
      source: "tcgcsv",
      label: "TCGCSV (TCGPlayer dump)",
      usd: csv?.market ?? null,
      note: "Daily public TCGPlayer price file — independent snapshot of the same market",
      url: csv?.url,
      family: "listed",
      weight: 0.1,
    },
    {
      source: "ebay-sold",
      label: "eBay sold median",
      usd: sold,
      note: "IQR-trimmed completed sales. Shop buyers weight this over asks.",
      url: soldUrl,
      family: "sold",
      weight: 0.28,
    },
    {
      source: "ebay-active",
      label: "eBay active BIN median",
      usd: active,
      note: "What is listed right now — often high vs what actually clears",
      url: `https://www.ebay.com/sch/183454/i.html?_nkw=${encodeURIComponent(`${card.name} ${card.setName}`)}&LH_BIN=1`,
      family: "listed",
      weight: 0.04,
    },
    {
      source: "pricecharting",
      label: "PriceCharting ungraded",
      usd: hasPcApi ? null : chart.ungraded,
      note: hasPcApi ? "Superseded by your PriceCharting API token" : "Sold-comp guide (raw / loose scrape)",
      url: chart.url || undefined,
      family: "sold",
      weight: hasPcApi ? 0 : 0.12,
    },
    {
      source: "pricecharting-psa9",
      label: "PriceCharting PSA 9",
      usd: hasPcApi ? null : chart.psa9,
      note: "Graded slab guide",
      url: chart.url || undefined,
      family: "sold",
      weight: 0,
    },
    {
      source: "pricecharting-psa10",
      label: "PriceCharting PSA 10",
      usd: hasPcApi ? null : chart.psa10,
      note: "Graded slab guide",
      url: chart.url || undefined,
      family: "sold",
      weight: 0,
    },
    {
      source: "psa10-model",
      label: "PSA 10 model",
      usd: psa10,
      note: "Raw market × desk grade bucket (not a sold comp)",
      family: "model",
      weight: 0,
    },
    ...keyed,
  ];

  return { quotes, fxEurUsd: fx, ...scoreBook(quotes) };
}
