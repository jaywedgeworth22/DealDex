import type { ScoredListing } from "@/lib/marketplaces/types";
import type { AlertChannel, AlertHit, AlertRule } from "./types";

export function listingMatchesRule(row: ScoredListing, rule: AlertRule): boolean {
  if (!rule.enabled) return false;
  const { listing, appraisal, parsed } = row;
  if (!rule.marketplaces.includes(listing.marketplace)) return false;
  const kw = rule.keyword.trim().toLowerCase();
  if (kw && !listing.title.toLowerCase().includes(kw)) return false;
  if (rule.maxPrice != null && (listing.price == null || listing.price > rule.maxPrice)) {
    return false;
  }
  if (rule.condition === "raw" && parsed.grade !== "raw") return false;
  if (rule.condition === "graded" && parsed.grade === "raw") return false;
  if (rule.verdicts.length && (!appraisal || !rule.verdicts.includes(appraisal.verdict))) {
    return false;
  }
  if (rule.minSpread != null && (appraisal?.spread == null || appraisal.spread < rule.minSpread)) {
    return false;
  }
  return true;
}

export function collectHits(rows: ScoredListing[], rules: AlertRule[]): AlertHit[] {
  const hits: AlertHit[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const channels = (Object.keys(rule.channels) as AlertChannel[]).filter((c) => rule.channels[c]);
    if (!channels.length) continue;
    for (const row of rows) {
      if (!listingMatchesRule(row, rule)) continue;
      const key = `${rule.id}:${row.listing.marketplace}:${row.listing.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        id: key,
        at: Date.now(),
        ruleId: rule.id,
        ruleName: rule.name,
        title: row.listing.title,
        url: row.listing.url,
        price: row.listing.price,
        spread: row.appraisal?.spread ?? null,
        verdict: row.appraisal?.verdict ?? null,
        marketplace: row.listing.marketplace,
        channels,
      });
    }
  }
  return hits;
}
