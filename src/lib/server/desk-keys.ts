import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { DeskKeys } from "@/lib/settings/keys";

function clean(input: unknown): DeskKeys {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const out: DeskKeys = {};
  for (const id of ["justtcg", "pricecharting", "pokemontcg"] as const) {
    const v = raw[id];
    if (typeof v === "string") out[id] = v.trim().slice(0, 200);
  }
  return out;
}

export const getAccountKeys = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      justtcg: string | null;
      pricecharting: string | null;
      pokemontcg: string | null;
    }>`select justtcg, pricecharting, pokemontcg from desk_keys where user_id = ${context.userId}`;
    const row = rows[0];
    if (!row) return {} as DeskKeys;
    return clean(row);
  });

export const saveAccountKeys = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: DeskKeys) => clean(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into desk_keys (user_id, justtcg, pricecharting, pokemontcg, updated_at)
      values (${context.userId}, ${data.justtcg ?? ""}, ${data.pricecharting ?? ""}, ${data.pokemontcg ?? ""}, now())
      on conflict (user_id) do update set
        justtcg = excluded.justtcg,
        pricecharting = excluded.pricecharting,
        pokemontcg = excluded.pokemontcg,
        updated_at = now()
    `;
    return { ok: true as const };
  });
