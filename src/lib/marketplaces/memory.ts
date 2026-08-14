import type { ScanSource, ScoredListing } from "./types";

const SCAN_KEY = "dealdex:scan-cache";
const LEDGER_KEY = "dealdex:listing-ledger";
const MAX_ROWS = 80;
const MAX_LISTINGS = 250;
const MAX_PRICES = 24;

export type PriceTick = { at: string; price: number; shipping: number };

export type ListingMemory = {
  firstSeen: string;
  lastSeen: string;
  listedAt: string | null;
  marketplace: ScanSource;
  id: string;
  title: string;
  url: string;
  prices: PriceTick[];
};

export type ScanCache = {
  q: string;
  sources: ScanSource[];
  at: string;
  rows: ScoredListing[];
  meta: { ebay: number; mercari: number; notes: string[] };
};

let ledger: Record<string, ListingMemory> | null = null;

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

export function listingKey(marketplace: string, id: string) {
  return `${marketplace}:${id}`;
}

export function loadScanCache(): ScanCache | null {
  const cached = readJson<ScanCache | null>(SCAN_KEY, null);
  if (!cached?.rows?.length) return null;
  return cached;
}

export function saveScanCache(cache: ScanCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SCAN_KEY,
      JSON.stringify({ ...cache, rows: cache.rows.slice(0, MAX_ROWS) }),
    );
  } catch {
    /* quota */
  }
}

function loadLedger() {
  if (!ledger) ledger = readJson<Record<string, ListingMemory>>(LEDGER_KEY, {});
  return ledger;
}

function persistLedger() {
  if (typeof window === "undefined" || !ledger) return;
  try {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  } catch {
    /* quota */
  }
}

export function peekListing(marketplace: string, id: string): ListingMemory | null {
  return loadLedger()[listingKey(marketplace, id)] ?? null;
}

export function rememberListings(rows: ScoredListing[]) {
  const book = loadLedger();
  const now = new Date().toISOString();
  for (const row of rows) {
    const listing = row.listing;
    const key = listingKey(listing.marketplace, listing.id);
    const prev = book[key];
    const tick =
      listing.price != null ? { at: now, price: listing.price, shipping: listing.shipping } : null;
    if (!prev) {
      book[key] = {
        firstSeen: now,
        lastSeen: now,
        listedAt: listing.listedAt ?? null,
        marketplace: listing.marketplace,
        id: listing.id,
        title: listing.title,
        url: listing.url,
        prices: tick ? [tick] : [],
      };
      continue;
    }
    prev.lastSeen = now;
    prev.title = listing.title;
    prev.url = listing.url;
    if (!prev.listedAt && listing.listedAt) prev.listedAt = listing.listedAt;
    if (tick) {
      const last = prev.prices[prev.prices.length - 1];
      if (!last || last.price !== tick.price || last.shipping !== tick.shipping) {
        prev.prices = [...prev.prices, tick].slice(-MAX_PRICES);
      }
    }
  }
  const keys = Object.keys(book);
  if (keys.length > MAX_LISTINGS) {
    const ranked = [...keys].sort((a, b) => book[a]!.lastSeen.localeCompare(book[b]!.lastSeen));
    for (const extra of ranked.slice(0, keys.length - MAX_LISTINGS)) delete book[extra];
  }
  persistLedger();
}

export function formatAge(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 21) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
