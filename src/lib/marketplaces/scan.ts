import { appraise } from "@/lib/tcg/appraise";
import { eurUsd, fetchEbaySoldMedian } from "@/lib/tcg/comps";
import { matchListing } from "@/lib/tcg/match";
import { parseListingBlob } from "@/lib/tcg/parse-listing";
import { fetchKeyedQuotes } from "@/lib/tcg/paid-sources";
import type { ListingInput, TcgCard } from "@/lib/tcg/types";
import { applyVerification } from "@/lib/tcg/verify";
import type { DeskKeys } from "@/lib/settings/keys";
import { searchEbay } from "./ebay";
import { significantTokens } from "./html";
import { searchMercari } from "./mercari";
import type { LiveListing, ScanSource, ScoredListing } from "./types";

export type { ScanSource };

function marketOf(card: TcgCard): number | null {
  return card.finishes.find((f) => f.market != null)?.market ?? null;
}

function pickScanCard(
  cards: TcgCard[],
  listing: LiveListing,
  parsed: ReturnType<typeof parseListingBlob>,
): TcgCard | null {
  if (!cards.length) return null;
  const q0 = significantTokens(parsed.nameQuery)[0];
  const title = listing.title.toLowerCase();
  let pool = cards;
  if (q0) {
    const named = cards.filter((c) => c.name.toLowerCase().includes(q0));
    if (named.length) pool = named;
  }
  const extras = ["dark", "blaine", "shining", "mega", "team aqua", "team magma"];
  const filtered = pool.filter((c) => {
    const nm = c.name.toLowerCase();
    const extra = extras.find((e) => nm.includes(e));
    return !extra || title.includes(extra);
  });
  if (filtered.length) pool = filtered;

  if (parsed.setHint) {
    const hint = parsed.setHint.toLowerCase();
    const hinted = pool.filter((c) => {
      const set = c.setName.toLowerCase();
      if (hint === "base set") return set === "base set";
      if (set === hint) return true;
      if (hint.length >= 8 && set.includes(hint)) return true;
      return false;
    });
    if (hinted.length) pool = hinted;
  }

  const priced = pool.filter((c) => marketOf(c) != null);
  const use = priced.length ? priced : pool;
  const strong = use.filter((c) => (c.matchScore ?? 0) >= 40);
  const candidates = strong.length ? strong : use;

  if (listing.price == null) {
    return strong[0] ?? candidates[0] ?? null;
  }
  if (candidates.length > 1) {
    const allIn = listing.price + listing.shipping;
    return [...candidates].sort((a, b) => {
      const ad = Math.abs((marketOf(a) ?? 0) - allIn);
      const bd = Math.abs((marketOf(b) ?? 0) - allIn);
      if (ad !== bd) return ad - bd;
      return (b.matchScore ?? 0) - (a.matchScore ?? 0);
    })[0]!;
  }
  return candidates[0] ?? null;
}

async function matchCached(
  parsed: ReturnType<typeof parseListingBlob>,
  cache: Map<string, TcgCard[]>,
): Promise<TcgCard[]> {
  const key = `${parsed.nameQuery}|${parsed.collectorNumber ?? ""}|${parsed.setHint ?? ""}`;
  let cards = cache.get(key);
  if (!cards) {
    cards = await matchListing(parsed);
    cache.set(key, cards);
  }
  return cards;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

export async function scanAndScore(
  query: string,
  sources: ScanSource[],
  keys: DeskKeys = {},
): Promise<{ rows: ScoredListing[]; ebay: number; mercari: number; notes: string[] }> {
  const notes: string[] = [];
  const listings: LiveListing[] = [];
  if (sources.includes("ebay")) {
    listings.push(...(await searchEbay(query).catch(() => [])));
  }
  if (sources.includes("mercari")) {
    listings.push(...(await searchMercari(query).catch(() => [])));
  }

  const ebay = listings.filter((l) => l.marketplace === "ebay").length;
  const mercari = listings.filter((l) => l.marketplace === "mercari").length;
  if (sources.includes("ebay") && ebay === 0) {
    notes.push("eBay returned no singles for that search.");
  }
  if (sources.includes("mercari") && mercari === 0) {
    notes.push("Mercari blocks direct reads — open their search, or try again.");
  }

  const hint = significantTokens(query).slice(0, 3).join(" ");
  const cache = new Map<string, TcgCard[]>();
  const fx = await eurUsd().catch(() => null);

  const scored = await mapPool(listings, 3, async (listing) => {
    const blob = `${listing.marketplace} ${listing.title} ${listing.price != null ? `$${listing.price}` : ""}`;
    const parsed = parseListingBlob(blob);
    parsed.url = listing.url;
    parsed.marketplace = listing.marketplace;
    if (listing.price != null) parsed.price = listing.price;
    parsed.shipping = listing.shipping;
    if (hint) parsed.nameQuery = hint;
    const cards = await matchCached(parsed, cache);
    const card = pickScanCard(cards, listing, parsed);
    let appraisal = null;
    if (card && listing.price != null) {
      const input: ListingInput = {
        title: listing.title,
        url: listing.url,
        marketplace: listing.marketplace,
        price: listing.price,
        shipping: listing.shipping,
        condition: parsed.condition,
        grade: parsed.grade,
        finish: parsed.finishHint,
      };
      appraisal = applyVerification(appraise(card, input), card, { fx });
    }
    return { listing, parsed, card, appraisal } satisfies ScoredListing;
  });

  const toConfirm = scored
    .filter(
      (row) =>
        row.card &&
        row.appraisal &&
        (row.appraisal.verdict === "steal" || row.appraisal.verdict === "good"),
    )
    .slice(0, 5);
  const keyedCache = new Map<string, Awaited<ReturnType<typeof fetchKeyedQuotes>>>();
  await mapPool(toConfirm, 3, async (row) => {
    if (!row.card || !row.appraisal) return row;
    const sold = await fetchEbaySoldMedian(row.card, row.parsed.grade).catch(() => null);
    let extraQuotes = keyedCache.get(row.card.id);
    if (!extraQuotes && (keys.justtcg || keys.pricecharting || keys.pokemontcg)) {
      extraQuotes = await fetchKeyedQuotes(row.card, keys).catch(() => []);
      keyedCache.set(row.card.id, extraQuotes);
    }
    row.appraisal = applyVerification(row.appraisal, row.card, {
      fx,
      sold,
      extraQuotes,
    });
    return row;
  });

  scored.sort((a, b) => {
    const as = a.appraisal?.spread ?? -99;
    const bs = b.appraisal?.spread ?? -99;
    return bs - as;
  });
  return { rows: scored, ebay, mercari, notes };
}
