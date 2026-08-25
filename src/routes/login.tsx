import { createFileRoute, Link } from "@tanstack/react-router";
import { SOCIAL_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { DealDexWordmark } from "@/components/app-mark";
import { APP_SUBTITLE } from "@/lib/copy";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 text-fg">
      <div className="w-full max-w-sm space-y-5 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <div>
          <DealDexWordmark className="mx-auto h-12 max-w-[18rem] sm:h-14 sm:max-w-[22rem]" />
          <p className="mt-3 text-center text-base text-muted">{APP_SUBTITLE}</p>
          <h1 className="mt-1 text-lg font-medium">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Guests can scan. An account is optional: it backs up saved deals and API keys. The
            Android and iPhone apps work on their own with keys saved on the phone.
          </p>
        </div>

        {authEnabled ? (
          <div className="space-y-2">
            {SOCIAL_PROVIDERS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => void signIn(p.id, { callbackURL: "/settings" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
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
