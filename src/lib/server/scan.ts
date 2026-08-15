import { createServerFn } from "@tanstack/react-start";
import { ALL_POKEMON_QUERY } from "@/lib/marketplaces/html";
import { scanAndScore } from "@/lib/marketplaces/scan";
import type { ScanSource } from "@/lib/marketplaces/types";
import type { DeskKeys } from "@/lib/settings/keys";
import { readScanCache, SCAN_FRESH_MS, scanCacheKey, writeScanCache } from "./scan-cache";

function cleanKeys(input: unknown): DeskKeys {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const out: DeskKeys = {};
  for (const id of ["justtcg", "pricecharting", "pokemontcg"] as const) {
    const v = raw[id];
    if (typeof v === "string" && v.trim()) out[id] = v.trim().slice(0, 200);
  }
  return out;
}

export const scanMarketplaces = createServerFn({ method: "POST" })
  .validator((input: { q: string; sources?: ScanSource[]; keys?: DeskKeys }) => ({
    q: String(input.q ?? "").slice(0, 160),
    sources: (input.sources?.length ? input.sources : ["ebay", "mercari"]) as ScanSource[],
    keys: cleanKeys(input.keys),
  }))
  .handler(async ({ data }) => {
    const query = data.q.trim() || ALL_POKEMON_QUERY;
    const key = scanCacheKey(query, data.sources);
    const cached = await readScanCache(key);
    if (cached && Date.now() - cached.at < SCAN_FRESH_MS) {
      return {
        query,
        ebay: cached.ebay,
        mercari: cached.mercari,
        notes: cached.notes,
        rows: cached.rows,
        fromCache: true,
      };
    }
    try {
      const result = await scanAndScore(query, data.sources, data.keys);
      if (result.rows.length) {
        await writeScanCache(key, query, data.sources, {
          ebay: result.ebay,
          mercari: result.mercari,
          notes: result.notes,
          rows: result.rows,
        });
      }
      return { query, ...result, fromCache: false };
    } catch (err) {
      if (cached) {
        return {
          query,
          ebay: cached.ebay,
          mercari: cached.mercari,
          notes: cached.notes,
          rows: cached.rows,
          fromCache: true,
        };
      }
      throw err;
    }
  });
