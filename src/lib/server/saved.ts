import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { CONDITIONS, GRADES, MARKETPLACES, VERDICTS } from "@/lib/tcg/types";

export type SavedRow = {
  id: string;
  createdAt: string;
  marketplace: string;
  listingTitle: string;
  listingUrl: string | null;
  listingPrice: number;
  shipping: number;
  condition: string;
  grade: string;
  finish: string | null;
  cardId: string;
  cardName: string;
  setName: string;
  marketPrice: number | null;
  allIn: number | null;
  spread: number | null;
  verdict: string;
};

type DbRow = {
  id: string;
  created_at: string;
  marketplace: string;
  listing_title: string;
  listing_url: string | null;
  listing_price: string | number;
  shipping: string | number;
  condition: string;
  grade: string;
  finish: string | null;
  card_id: string;
  card_name: string;
  set_name: string;
  market_price: string | number | null;
  all_in: string | number | null;
  spread: string | number | null;
  verdict: string;
};

function n(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : null;
}

function mapRow(r: DbRow): SavedRow {
  return {
    id: r.id,
    createdAt: r.created_at,
    marketplace: r.marketplace,
    listingTitle: r.listing_title,
    listingUrl: r.listing_url,
    listingPrice: n(r.listing_price) ?? 0,
    shipping: n(r.shipping) ?? 0,
    condition: r.condition,
    grade: r.grade,
    finish: r.finish,
    cardId: r.card_id,
    cardName: r.card_name,
    setName: r.set_name,
    marketPrice: n(r.market_price),
    allIn: n(r.all_in),
    spread: n(r.spread),
    verdict: r.verdict,
  };
}

export const listSaved = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<DbRow>`
      select id, created_at, marketplace, listing_title, listing_url,
             listing_price, shipping, condition, grade, finish,
             card_id, card_name, set_name, market_price, all_in, spread, verdict
      from appraisals
      where user_id = ${context.userId}
      order by created_at desc
      limit 50
    `;
    return rows.map(mapRow);
  });

/** Bound every field. The previous validator was `(input) => input`. */
function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function money(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(-1e9, Math.min(1e9, n)) : null;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export const saveAppraisal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Omit<SavedRow, "createdAt">) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const url = text(raw.listingUrl, 500);
    return {
      // The client mints this id and keeps the same one in local storage, so
      // the two stay removable together. It is safe as a key only because
      // migration 0005 scopes the primary key to (user_id, id) — before that a
      // chosen id could collide with another user's row.
      id: text(raw.id, 80) || randomUUID(),
      marketplace: oneOf(raw.marketplace, MARKETPLACES, "other"),
      listingTitle: text(raw.listingTitle, 240),
      listingUrl: /^https?:\/\//i.test(url) ? url : null,
      listingPrice: money(raw.listingPrice) ?? 0,
      shipping: money(raw.shipping) ?? 0,
      condition: oneOf(raw.condition, CONDITIONS, "NM"),
      grade: oneOf(raw.grade, GRADES, "raw"),
      finish: text(raw.finish, 60) || null,
      cardId: text(raw.cardId, 80),
      cardName: text(raw.cardName, 120),
      setName: text(raw.setName, 120),
      marketPrice: money(raw.marketPrice),
      allIn: money(raw.allIn),
      spread: money(raw.spread),
      verdict: oneOf(raw.verdict, VERDICTS, "fair"),
    } satisfies Omit<SavedRow, "createdAt">;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into appraisals (
        id, user_id, marketplace, listing_title, listing_url, listing_price,
        shipping, condition, grade, finish, card_id, card_name, set_name,
        market_price, all_in, spread, verdict
      ) values (
        ${data.id}, ${context.userId}, ${data.marketplace}, ${data.listingTitle},
        ${data.listingUrl}, ${data.listingPrice}, ${data.shipping}, ${data.condition},
        ${data.grade}, ${data.finish}, ${data.cardId}, ${data.cardName}, ${data.setName},
        ${data.marketPrice}, ${data.allIn}, ${data.spread}, ${data.verdict}
      )
      on conflict (user_id, id) do update set
        listing_price = excluded.listing_price,
        shipping = excluded.shipping,
        condition = excluded.condition,
        grade = excluded.grade,
        finish = excluded.finish,
        market_price = excluded.market_price,
        all_in = excluded.all_in,
        spread = excluded.spread,
        verdict = excluded.verdict
    `;
    return { ok: true as const };
  });

export const deleteSaved = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => ({ id: String(input?.id ?? "").slice(0, 80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from appraisals where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
