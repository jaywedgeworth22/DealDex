import { createFileRoute } from "@tanstack/react-router";
import { ALL_POKEMON_QUERY } from "@/lib/marketplaces/html";
import { scanAndScore } from "@/lib/marketplaces/scan";
import type { ScanSource } from "@/lib/marketplaces/types";
import { nativeScanRows } from "@/lib/native/scan-payload";
import type { DeskKeys } from "@/lib/settings/keys";
import { readScanCache, SCAN_FRESH_MS, scanCacheKey, writeScanCache } from "@/lib/server/scan-cache";

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

function sourcesOf(input: unknown): ScanSource[] {
  if (!Array.isArray(input)) return ["ebay", "mercari"];
  const next = input.filter((s): s is ScanSource => s === "ebay" || s === "mercari");
  return next.length ? next : ["ebay", "mercari"];
}

async function json(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const Route = createFileRoute("/api/native/scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await json(request);
        const q = String(body.q ?? "").slice(0, 160);
        const sources = sourcesOf(body.sources);
        const keys = cleanKeys(body.keys);
        const query = q.trim() || ALL_POKEMON_QUERY;
        const cacheKey = scanCacheKey(query, sources);
        const cached = await readScanCache(cacheKey);
        if (cached && Date.now() - cached.at < SCAN_FRESH_MS) {
          return Response.json({
            query,
            ebay: cached.ebay,
            mercari: cached.mercari,
            notes: cached.notes,
            rows: nativeScanRows(cached.rows),
            fromCache: true,
          });
        }
        try {
          const result = await scanAndScore(query, sources, keys);
          if (result.rows.length) {
            await writeScanCache(cacheKey, query, sources, {
              ebay: result.ebay,
              mercari: result.mercari,
              notes: result.notes,
              rows: result.rows,
            });
          }
          return Response.json({
            query,
            ebay: result.ebay,
            mercari: result.mercari,
            notes: result.notes,
            rows: nativeScanRows(result.rows),
            fromCache: false,
          });
        } catch (err) {
          if (cached) {
            return Response.json({
              query,
              ebay: cached.ebay,
              mercari: cached.mercari,
              notes: cached.notes,
              rows: nativeScanRows(cached.rows),
              fromCache: true,
            });
          }
          const message = err instanceof Error ? err.message : "Scan failed";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});
