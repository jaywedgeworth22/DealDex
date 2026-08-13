import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim().split("@")[0] || "Collector",
        });
        if (res.error) throw new Error(res.error.message || "Could not create account");
      } else {
        const res = await authClient.signIn.email({ email: email.trim(), password });
        if (res.error) throw new Error(res.error.message || "Could not sign in");
      }
      await nav({ to: "/settings" });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 text-fg">
      <div className="w-full max-w-sm space-y-5 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <div>
          <p className="font-display text-2xl tracking-tight">DealDex</p>
          <h1 className="mt-1 text-lg font-medium">
            {mode === "up" ? "Create an account" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Guests can scan. An account is optional: it backs up saved deals and API keys. The
            Android and iPhone apps work on their own with keys saved on the phone.
          </p>
        </div>

        {authEnabled ? (
          <>
            <form className="space-y-3" onSubmit={(e) => void onEmail(e)}>
              {mode === "up" && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  className="mt-1"
                />
              </div>
              {err && <p className="text-sm text-deal-bad">{err}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Working…" : mode === "up" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              className="text-sm text-muted hover:text-fg"
              onClick={() => {
                setMode((m) => (m === "in" ? "up" : "in"));
                setErr(null);
              }}
            >
              {mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
            <div className="space-y-2 border-t border-border pt-4">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/settings" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <Link to="/" className="block text-center text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
