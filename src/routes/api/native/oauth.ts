import { createFileRoute } from "@tanstack/react-router";
import { auth, SESSION_TOKEN_COOKIE } from "@/lib/auth/server";
import { SOCIAL_PROVIDER_IDS, type SocialProviderId } from "@/lib/auth/providers";
import { isValidChallenge, newCode, storeCode } from "@/lib/server/native-auth-codes";

const NATIVE_SCHEME = "dealdex";
const ALLOWED = SOCIAL_PROVIDER_IDS;

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    const raw = trimmed.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

function nativeRedirect(params: Record<string, string>): Response {
  const q = new URLSearchParams(params);
  const location = `${NATIVE_SCHEME}://auth?${q.toString()}`;
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store" },
  });
}

/**
 * Native sign-in handoff.
 *
 * PKCE-style, because the return leg lands on a custom URL scheme that any app
 * on the device may register:
 *
 *   1. the app generates a `verifier`, sends `challenge = sha256(verifier)`;
 *   2. we carry the challenge through the OAuth round trip in `callbackURL`;
 *   3. on return we mint a single-use `code`, store it against the challenge,
 *      and redirect `dealdex://auth?code=…`;
 *   4. the app POSTs `{ code, verifier }` to `/api/native/exchange`.
 *
 * A scheme hijacker sees only the code, which is worthless without the verifier
 * that never left the legitimate app. Previously step 3 redirected the live
 * session token itself, so interception was account takeover.
 */
export const Route = createFileRoute("/api/native/oauth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("done") === "1") {
          if (url.searchParams.has("error")) {
            return nativeRedirect({
              error: url.searchParams.get("error") || "sign_in_failed",
            });
          }
          const challenge = url.searchParams.get("challenge");
          if (!isValidChallenge(challenge)) {
            return nativeRedirect({ error: "missing_challenge" });
          }
          const token = readCookie(request, SESSION_TOKEN_COOKIE);
          if (!token) {
            return nativeRedirect({ error: "no_session" });
          }
          let email = "";
          try {
            const session = await auth.api.getSession({ headers: request.headers });
            email = session?.user?.email ?? "";
          } catch {
            /* the token is still usable as a Bearer credential */
          }
          const code = newCode();
          try {
            await storeCode(code, challenge, { token, email });
          } catch {
            return nativeRedirect({ error: "code_store_failed" });
          }
          return nativeRedirect({ code });
        }

        const providerId = (url.searchParams.get("provider") ?? "google").trim();
        if (!ALLOWED.has(providerId)) {
          return nativeRedirect({ error: "unknown_provider" });
        }
        const challenge = url.searchParams.get("challenge");
        if (!isValidChallenge(challenge)) {
          return nativeRedirect({ error: "missing_challenge" });
        }

        const back = `${url.origin}/api/native/oauth?done=1&challenge=${encodeURIComponent(challenge)}`;
        try {
          const apiRes = await auth.api.signInSocial({
            body: {
              provider: providerId as SocialProviderId,
              callbackURL: back,
              errorCallbackURL: `${back}&error=1`,
            },
            headers: request.headers,
            asResponse: true,
          });
          if (!apiRes.ok) {
            return nativeRedirect({ error: `oauth_init_failed_${apiRes.status}` });
          }
          const body = (await apiRes.json().catch(() => null)) as { url?: string } | null;
          const location = body?.url;
          if (!location) {
            return nativeRedirect({ error: "oauth_init_missing_url" });
          }
          const headers = new Headers({ location, "cache-control": "no-store" });
          for (const cookie of apiRes.headers.getSetCookie()) {
            headers.append("set-cookie", cookie);
          }
          return new Response(null, { status: 302, headers });
        } catch (err) {
          const message = err instanceof Error ? err.message : "oauth_init_threw";
          return nativeRedirect({ error: message });
        }
      },
    },
  },
});
