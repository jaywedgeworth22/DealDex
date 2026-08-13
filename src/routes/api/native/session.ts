import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function json(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const Route = createFileRoute("/api/native/session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await json(request);
        const email = String(body.email ?? "").trim();
        const password = String(body.password ?? "");
        const name = String(body.name ?? "").trim() || email.split("@")[0] || "Collector";
        const action = body.action === "signup" ? "signup" : "signin";
        if (!email || password.length < 8) {
          return Response.json({ error: "Email and a password of 8+ characters are required." }, { status: 400 });
        }
        try {
          if (action === "signup") {
            const res = await auth.api.signUpEmail({ body: { email, password, name } });
            return Response.json({
              token: (res as { token?: string }).token ?? null,
              user: { id: res.user.id, email: res.user.email, name: res.user.name },
            });
          }
          const res = await auth.api.signInEmail({ body: { email, password } });
          return Response.json({
            token: (res as { token?: string }).token ?? null,
            user: { id: res.user.id, email: res.user.email, name: res.user.name },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign-in failed";
          return Response.json({ error: message }, { status: 401 });
        }
      },
    },
  },
});
