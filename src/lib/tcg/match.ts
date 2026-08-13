import type { ParsedListing, TcgCard } from "./types";
import { fetchCard, searchCardIndex } from "./tcgdex";

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
  const overlap = qToks.filter((t) => nameToks.includes(t) || titleToks.includes(t));
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
    const exact = hint === "base set" ? set === "base set" : set === hint || (hint.length >= 8 && set.includes(hint));
    if (exact) {
      score += 22;
      reasons.push(card.setName);
    }
  } else if (card.setName) {
    const setToks = tokens(card.setName);
    if (setToks.some((t) => t.length > 3 && titleToks.includes(t))) {
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
