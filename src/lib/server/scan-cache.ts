import { getSql } from "@/lib/db";
import type { ScanSource, ScoredListing } from "@/lib/marketplaces/types";

export const SCAN_FRESH_MS = 8 * 60 * 1000;
const MAX_ROWS = 48;

export type CachedScan = {
  ebay: number;
  mercari: number;
  notes: string[];
  rows: ScoredListing[];
  at: number;
};

/**
 * Cache key.
 *
 * `paidDesks` is part of the key because results computed with ONE user's paid
 * desk keys were previously served to every other caller for the freshness
 * window — so a subscriber's PriceCharting and JustTCG data leaked into guests'
 * scans, and a guest's thinner book could just as easily be served back to the
 * subscriber who paid for the better one.
 */
export function scanCacheKey(q: string, sources: ScanSource[], paidDesks = false) {
  return `${q.trim().toLowerCase()}::${[...sources].sort().join(",")}::${paidDesks ? "paid" : "free"}`;
}

/** Rows older than this are swept on write. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Hard ceiling on stored rows, so a hostile query stream cannot fill the table. */
const MAX_CACHE_ROWS = 500;

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * `migrations/0004_scan_cache.sql` owns this table. This used to issue a
 * `create table if not exists` before EVERY read and write, which duplicated the
 * migration and added a round trip to every scan.
 */
async function ensureTable() {
  return getSql();
}

/**
 * Drop expired rows and cap the table.
 *
 * `/api/native/scan` is unauthenticated and the key includes a 160-character
 * query, so without this an attacker could mint unbounded rows — each holding up
 * to 48 serialised listings with full card objects — and never have any of them
 * removed. Runs on write, which is the only path that grows the table.
 */
async function sweep(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql`delete from scan_cache where at < now() - ${`${CACHE_TTL_MS} milliseconds`}::interval`;
  await sql`
    delete from scan_cache
    where cache_key in (
      select cache_key from scan_cache order by at desc offset ${MAX_CACHE_ROWS}
    )
  `;
}

export async function readScanCache(key: string): Promise<CachedScan | null> {
  try {
    const sql = await ensureTable();
    const rows = await sql<{
      at: string;
      ebay: number;
      mercari: number;
      notes: string;
      rows: string;
    }>`select at, ebay, mercari, notes, rows from scan_cache where cache_key = ${key}`;
    const hit = rows[0];
    if (!hit) return null;
    const listed = parseJson<ScoredListing[]>(hit.rows, []);
    const notes = parseJson<string[]>(hit.notes, []);
    const at = new Date(hit.at).getTime();
    if (!Number.isFinite(at) || !listed.length) return null;
    return {
      ebay: Number(hit.ebay) || 0,
      mercari: Number(hit.mercari) || 0,
      notes,
      rows: listed,
      at,
    };
  } catch {
    return null;
  }
}

export async function writeScanCache(
  key: string,
  q: string,
  sources: ScanSource[],
  payload: { ebay: number; mercari: number; notes: string[]; rows: ScoredListing[] },
) {
  try {
    const sql = await ensureTable();
    const src = [...sources].sort().join(",");
    const listed = JSON.stringify(payload.rows.slice(0, MAX_ROWS));
    const notes = JSON.stringify(payload.notes);
    await sweep(sql);
    await sql`
      insert into scan_cache (cache_key, q, sources, at, ebay, mercari, notes, rows)
      values (${key}, ${q}, ${src}, now(), ${payload.ebay}, ${payload.mercari}, ${notes}, ${listed})
      on conflict (cache_key) do update set
        q = excluded.q,
        sources = excluded.sources,
        at = excluded.at,
        ebay = excluded.ebay,
        mercari = excluded.mercari,
        notes = excluded.notes,
        rows = excluded.rows
    `;
  } catch {
    /* desk still works without a shared cache */
  }
}
