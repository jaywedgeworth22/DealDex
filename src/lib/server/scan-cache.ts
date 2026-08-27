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
 * Cache key. Free-desk scans only — see `isCacheable`.
 */
export function scanCacheKey(q: string, sources: ScanSource[]) {
  return `${q.trim().toLowerCase()}::${[...sources].sort().join(",")}::free`;
}

/**
 * Whether a scan may be shared through the cache at all.
 *
 * Results computed with ONE caller's paid desk keys were previously served to
 * every other caller for the freshness window. Adding a `paid` flag to the key
 * was not enough either: every subscriber then shared a single `paid` bucket
 * regardless of WHICH desks produced it, so a JustTCG subscriber could be served
 * a book built from someone else's PriceCharting token.
 *
 * There is no key that makes a cross-user cache of paid data correct, so a scan
 * that used any paid desk is simply never cached. Paid callers pay a little
 * latency; nobody sees anybody else's paid book.
 */
export function isCacheable(paidDesks: boolean): boolean {
  return !paidDesks;
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
