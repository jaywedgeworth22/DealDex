import { createFileRoute } from "@tanstack/react-router";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { redeemCode } from "@/lib/server/native-auth-codes";

/**
 * Second leg of the native sign-in handoff: trade a single-use code plus the
 * device's verifier for the session token.
 *
 * See `/api/native/oauth` for the full flow. The code alone is useless, which is
 * the whole point — a rogue app that claims the `dealdex://` scheme can read the
 * redirect but cannot complete this call.
 */
export const Route = createFileRoute("/api/native/exchange")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Codes are single-use and short-lived, but rate-limit anyway so the
        // endpoint cannot be used to grind at recently issued codes.
        const limit = rateLimit(clientKey(request, "native-exchange"), 20, 60_000);
        if (!limit.ok) {
          return Response.json(
            { error: "Too many attempts. Try signing in again in a minute." },
            {
              status: 429,
              headers: { "retry-after": String(Math.ceil(limit.retryAfterMs / 1000)) },
            },
          );
        }

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const code = typeof body.code === "string" ? body.code.trim().slice(0, 200) : "";
        const verifier =
          typeof body.verifier === "string" ? body.verifier.trim().slice(0, 200) : "";
        if (!code || verifier.length < 32) {
          return Response.json({ error: "Missing code or verifier." }, { status: 400 });
        }

        const session = await redeemCode(code, verifier).catch(() => null);
        if (!session) {
          // One message for expired, already-used, unknown and mismatched, so
          // the response cannot be used to tell those cases apart.
          return Response.json({ error: "That sign-in link is no longer valid." }, { status: 401 });
        }

        return Response.json(
          { token: session.token, email: session.email },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
