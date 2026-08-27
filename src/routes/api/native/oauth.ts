import { createFileRoute } from "@tanstack/react-router";
import { auth, SESSION_TOKEN_COOKIE } from "@/lib/auth/server";
import { SOCIAL_PROVIDER_IDS, type SocialProviderId } from "@/lib/auth/providers";
import {
  isValidChallenge,
  newCode,
  storeCode,
  storePendingAuth,
  takePendingAuth,
} from "@/lib/server/native-auth-codes";

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

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * Hand-off page.
 *
 * Deliberately NOT an automatic 302 into `dealdex://`. A private-use URI scheme
 * is claimable by any installed app (RFC 8252 §8.1), so an automatic redirect
 * lets a flow the user never started complete silently in the background. One
 * tap, with the account named, means a sign-in the user did not initiate cannot
 * finish without them seeing whose account is being handed over.
 */
function handoffPage(code: string, email: string): Response {
  const target = `${NATIVE_SCHEME}://auth?${new URLSearchParams({ code }).toString()}`;
  const who = email ? `as ${escapeHtml(email)}` : "";
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Open DealDex</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center;
         background:#f3efe6; color:#1a1b16;
         font:16px/1.5 "IBM Plex Sans", system-ui, -apple-system, sans-serif; }
  main { max-width:26rem; padding:2rem 1.5rem; text-align:center; }
  h1 { font-size:1.5rem; margin:0 0 .5rem; letter-spacing:-.01em; }
  p { color:#3a3832; margin:0 0 1.5rem; }
  a.go { display:inline-block; background:#4a3224; color:#f6f3ea; text-decoration:none;
         padding:.9rem 1.75rem; border-radius:.75rem; font-weight:600; }
  a.go:focus-visible { outline:3px solid #3f4a32; outline-offset:3px; }
  small { display:block; margin-top:1.25rem; color:#3a3832; }
</style>
</head><body><main>
<h1>Finish signing in</h1>
<p>Return to the DealDex app${who ? ` ${who}` : ""}.</p>
<a class="go" href="${escapeHtml(target)}">Open DealDex</a>
<small>If you did not start this sign-in, close this page instead.</small>
</main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

/**
 * Native sign-in handoff.
 *
 * PKCE-style, because the return leg lands on a custom URL scheme that any app
 * on the device may register:
 *
 *   1. the app generates a `verifier` and sends `challenge = sha256(verifier)`;
 *   2. we mint a random `state`, store it against that challenge, and send ONLY
 *      the state through the OAuth round trip;
 *   3. on return we look the challenge up by state (single use), mint a
 *      single-use `code`, and hand it over on a page the user must tap;
 *   4. the app POSTs `{ code, verifier }` to `/api/native/exchange`.
 *
 * Step 2 is load-bearing and was missing in the first version of this file: the
 * `done=1` leg read `challenge` straight off the query string and validated only
 * its shape. Since the session cookie is SameSite=Lax it rides along on a
 * top-level GET navigation, so a malicious app could open
 * `…/oauth?done=1&challenge=<its own>`, catch `dealdex://auth?code=…` on its own
 * intent filter, and redeem the code with the verifier it chose — full account
 * takeover, with PKCE contributing nothing. See `migrations/0007`.
 *
 * RESIDUAL RISK, stated plainly: this still relies on a private-use URI scheme.
 * An app can start its own flow at step 1, and if the browser already holds a
 * live provider session the round trip completes without a provider prompt. The
 * tap-through in `handoffPage` is what stands in the way. The real fix is a
 * claimed HTTPS redirect — Android App Links plus `assetlinks.json`, iOS
 * Universal Links plus an Associated Domains entitlement — which needs the
 * release signing fingerprint and a portal capability this repo does not have
 * yet. Tracked in the rollout note. iOS is already better off in practice:
 * `ASWebAuthenticationSession` delivers the callback to the session that opened
 * it rather than through the system URL handler.
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

          // The challenge comes from OUR record of this flow, never from the
          // caller. A state we did not issue (or already spent) ends here.
          const state = url.searchParams.get("state") ?? "";
          const challenge = state ? await takePendingAuth(state).catch(() => null) : null;
          if (!challenge) {
            return nativeRedirect({ error: "sign_in_expired" });
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
          return handoffPage(code, email);
        }

        const providerId = (url.searchParams.get("provider") ?? "google").trim();
        if (!ALLOWED.has(providerId)) {
          return nativeRedirect({ error: "unknown_provider" });
        }
        const challenge = url.searchParams.get("challenge");
        if (!isValidChallenge(challenge)) {
          return nativeRedirect({ error: "missing_challenge" });
        }

        const state = newCode();
        try {
          await storePendingAuth(state, challenge);
        } catch {
          return nativeRedirect({ error: "sign_in_unavailable" });
        }

        const back = `${url.origin}/api/native/oauth?done=1&state=${encodeURIComponent(state)}`;
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
