import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import { decryptSecret, encryptSecret } from "@/lib/server/secret-box";

function bearer(request: Request): string | undefined {
  const h = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1]?.trim();
}

function clean(input: unknown) {
  if (!input || typeof input !== "object")
    return { justtcg: "", pricecharting: "", pokemontcg: "" };
  const raw = input as Record<string, unknown>;
  const one = (k: string) => (typeof raw[k] === "string" ? raw[k].trim().slice(0, 200) : "");
  return {
    justtcg: one("justtcg"),
    pricecharting: one("pricecharting"),
    pokemontcg: one("pokemontcg"),
  };
}

export const Route = createFileRoute("/api/native/keys")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(bearer(request));
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const sql = await getSql();
        const rows = await sql<{
          justtcg: string | null;
          pricecharting: string | null;
          pokemontcg: string | null;
        }>`select justtcg, pricecharting, pokemontcg from desk_keys where user_id = ${user.id}`;
        const row = rows[0];
        return Response.json(
          clean(
            row
              ? {
                  justtcg: decryptSecret(row.justtcg),
                  pricecharting: decryptSecret(row.pricecharting),
                  pokemontcg: decryptSecret(row.pokemontcg),
                }
              : {},
          ),
        );
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(bearer(request));
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const data = clean(await request.json().catch(() => ({})));
        const sql = await getSql();
        await sql`
          insert into desk_keys (user_id, justtcg, pricecharting, pokemontcg, updated_at)
          values (
            ${user.id},
            ${encryptSecret(data.justtcg)},
            ${encryptSecret(data.pricecharting)},
            ${encryptSecret(data.pokemontcg)},
            now()
          )
          on conflict (user_id) do update set
            justtcg = excluded.justtcg,
            pricecharting = excluded.pricecharting,
            pokemontcg = excluded.pokemontcg,
            updated_at = now()
        `;
        return Response.json({ ok: true });
      },
    },
  },
});
