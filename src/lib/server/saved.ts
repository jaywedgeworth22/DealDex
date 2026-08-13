import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

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

export const saveAppraisal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Omit<SavedRow, "createdAt">) => input)
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
    `;
    return { ok: true as const };
  });

export const deleteSaved = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => ({ id: String(input.id ?? "") }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from appraisals where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
