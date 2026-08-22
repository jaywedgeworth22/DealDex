import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Lead } from "@/components/lead";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Legal</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Privacy</h1>
      <Lead>
        DealDex keeps marketplace keys on your device.  Sign-in is optional and only backs up
        those keys to your account.
      </Lead>

      <div className="mt-8 max-w-2xl space-y-6 text-sm leading-relaxed text-muted">
        <section className="space-y-2">
          <h2 className="font-display text-xl tracking-tight text-fg">What stays on the phone</h2>
          <p>
            API keys you paste in Settings (eBay, Mercari, JustTCG, PriceCharting, pokemontcg.io,
            and other desks) live in on-device storage.  The apps scan marketplaces from the
            device.  They do not send those keys to DealDex servers.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl tracking-tight text-fg">Optional account</h2>
          <p>
            If you sign in, DealDex stores your email and any keys you choose to back up so you
            can restore them on another device.  You can use the apps without an account.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl tracking-tight text-fg">Website analytics</h2>
          <p>
            The DealDex website uses Vercel Web Analytics to count visits and page views.  That
            product does not use cookies and does not identify you.  Native apps do not send those
            web page-view events.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl tracking-tight text-fg">Notifications</h2>
          <p>
            The iPhone app may ask to send local alerts when a listing matches a rule you set.
            You can decline.  DealDex does not send marketing push.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl tracking-tight text-fg">Contact</h2>
          <p>
            Questions: use the email on the App Store or Play listing.  This page is the
            privacy policy for the DealDex website and the native apps.
          </p>
        </section>
      </div>
    </Shell>
  );
}
