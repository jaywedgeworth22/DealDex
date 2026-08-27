import type { ParsedListing, TcgCard } from "./types";
import { fetchCard, searchCardIndex } from "./tcgdex";

/**
 * Set words so common across Pokemon products that matching one says nothing
 * about which set a listing is from.
 */
const GENERIC_SET_TOKENS = new Set([
  "series",
  "promo",
  "promos",
  "collection",
  "collections",
  "gallery",
  "trainer",
  "deck",
  "box",
  "black",
  "star",
  "pokemon",
  "pokémon",
  "card",
  "cards",
]);

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function scoreMatch(
  card: { id: string; name: string; localId: string; setName?: string },
  parsed: ParsedListing,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const nameToks = tokens(card.name);
  const qToks = tokens(parsed.nameQuery);
  const titleToks = tokens(parsed.title);
  // Only count tokens that appear in THIS CARD's name. The old condition also
  // accepted `titleToks.includes(t)` — but qToks are derived from the listing
  // title, so that arm matched for every candidate equally and handed the same
  // bonus to a completely unrelated card.
  const overlap = qToks.filter((t) => nameToks.includes(t));
  if (overlap.length) {
    score += overlap.length * 8;
    reasons.push("Name overlap");
  }
  if (nameToks.join(" ") === qToks.join(" ")) {
    score += 18;
    reasons.push("Exact name");
  }
  if (parsed.collectorNumber) {
    const n = parsed.collectorNumber.replace(/^0+/, "").toLowerCase();
    const local = String(card.localId).replace(/^0+/, "").toLowerCase();
    if (n && n === local) {
      score += 40;
      reasons.push(`#${card.localId}`);
    }
  }
  if (parsed.setHint && card.setName) {
    const set = card.setName.toLowerCase();
    const hint = parsed.setHint.toLowerCase();
    const exact =
      hint === "base set"
        ? set === "base set"
        : set === hint || (hint.length >= 8 && set.includes(hint));
    if (exact) {
      score += 22;
      reasons.push(card.setName);
    }
  } else if (card.setName) {
    // Fallback when the title carries no recognised set alias. One shared word
    // is not evidence: "POP Series 4" used to score 12 against any listing whose
    // title happened to contain "Series", which is how a Charmander promo got
    // matched to a Pokemon Fan Club trainer card. Require either two distinctive
    // tokens or one long one.
    const hits = tokens(card.setName).filter(
      (t) => t.length > 3 && !GENERIC_SET_TOKENS.has(t) && titleToks.includes(t),
    );
    if (hits.length >= 2 || (hits.length === 1 && hits[0]!.length >= 7)) {
      score += 12;
      reasons.push(card.setName);
    }
  }
  return { score, reasons };
}

export async function matchListing(parsed: ParsedListing): Promise<TcgCard[]> {
  const parts = parsed.nameQuery.split(" ").filter((p) => p.length > 2);
  const queries = [...new Set([parsed.nameQuery, parts[0]].filter(Boolean))] as string[];

  const seen = new Set<string>();
  const index: Array<{ id: string; name: string; localId: string }> = [];

  const add = (rows: Array<{ id: string; name: string; localId: string }>) => {
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      index.push(row);
    }
  };

  if (parsed.collectorNumber) {
    const num = parsed.collectorNumber.replace(/^0+/, "");
    for (const q of queries) {
      add(await searchCardIndex(q, num));
    }
  }

  for (const q of queries) {
    add(await searchCardIndex(q, null));
    if (index.length >= 24) break;
  }

  const ranked = index
    .map((row) => {
      const { score, reasons } = scoreMatch(row, parsed);
      return { row, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  const picked: typeof ranked = [];
  const sets = new Set<string>();
  for (const item of ranked) {
    const set = item.row.id.split("-")[0] ?? item.row.id;
    if (picked.length >= 12) break;
    if (sets.has(set) && picked.length >= 5) continue;
    picked.push(item);
    sets.add(set);
  }

  const hydrated = await Promise.all(
    picked.map(async ({ row, score, reasons }) => {
      const card = await fetchCard(row.id);
      if (!card) return null;
      const next: TcgCard = { ...card, matchScore: score, matchReasons: reasons };
      return next;
    }),
  );

  const cards = hydrated.filter((c): c is TcgCard => c != null);

  return cards
    .map((card) => {
      const { score, reasons } = scoreMatch(card, parsed);
      const priced = card.finishes.some((f) => f.market != null);
      return { ...card, matchScore: score + (priced ? 4 : 0), matchReasons: reasons };
    })
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
