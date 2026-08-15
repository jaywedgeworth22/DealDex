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

export function scanCacheKey(q: string, sources: ScanSource[]) {
  return `${q.trim().toLowerCase()}::${[...sources].sort().join(",")}`;
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function ensureTable() {
  const sql = await getSql();
  await sql.query(`
    create table if not exists scan_cache (
      cache_key text primary key,
      q text not null,
      sources text not null,
      at timestamptz not null default now(),
      ebay int not null default 0,
      mercari int not null default 0,
      notes text not null default '[]',
      rows text not null default '[]'
    )
  `);
  return sql;
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
    return { ebay: Number(hit.ebay) || 0, mercari: Number(hit.mercari) || 0, notes, rows: listed, at };
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
