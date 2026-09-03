import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Native Apple Sign In — identity token exchange.
 *
 * iOS uses ASAuthorizationAppleIDProvider which hands back an identityToken
 * (a signed JWT from Apple) directly to the app — no web redirect needed.
 * This endpoint receives that token, has Better Auth verify it against
 * Apple's public JWKS, creates a session, and returns the bearer token.
 *
 * Request body (JSON):
 *   { identityToken: string, user?: { name?: string, email?: string } }
 *
 * Response (JSON):
 *   { token: string, email: string }   on success
 *   { error: string }                  on failure (4xx)
 */
export const Route = createFileRoute("/api/native/apple-signin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { identityToken?: string; user?: { name?: string; email?: string } };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid_body" }, { status: 400 });
        }

        const identityToken = body?.identityToken?.trim();
        if (!identityToken) {
          return Response.json({ error: "missing_identity_token" }, { status: 400 });
        }

        try {
          // Better Auth's signInSocial accepts an idToken for Apple — it validates
          // the JWT against https://appleid.apple.com/auth/keys and creates a session.
          const res = await auth.api.signInSocial({
            body: {
              provider: "apple",
              idToken: {
                token: identityToken,
                // Apple only sends the user's name/email on the very first sign-in.
                // Forward it so Better Auth can populate the user record.
                ...(body.user ? { user: body.user } : {}),
              },
            },
            asResponse: true,
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => null) as { message?: string } | null;
            const msg = errBody?.message ?? `auth_failed_${res.status}`;
            return Response.json({ error: msg }, { status: 401 });
          }

          const data = await res.json() as { token?: string; user?: { email?: string } };
          const token = data?.token;
          if (!token) {
            return Response.json({ error: "no_token_returned" }, { status: 500 });
          }

          return Response.json({
            token,
            email: data?.user?.email ?? "",
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "sign_in_failed";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
