import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lead } from "@/components/lead";
import { AppearanceToggle } from "@/components/appearance-toggle";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { testDeskKey } from "@/lib/server/tcg";
import { getAccountKeys, saveAccountKeys } from "@/lib/server/desk-keys";
import {
  DESK_KEY_META,
  countDeskKeys,
  loadDeskKeys,
  saveDeskKeys,
  type DeskKeyId,
  type DeskKeys,
} from "@/lib/settings/keys";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, isPending } = useCurrentUserState();
  const [keys, setKeys] = useState<DeskKeys>({});
  const [show, setShow] = useState<Partial<Record<DeskKeyId, boolean>>>({});
  const [testing, setTesting] = useState<DeskKeyId | null>(null);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const local = loadDeskKeys();
    setKeys(local);
    if (isPending || !user) return;
    let live = true;
    getAccountKeys()
      .then((remote) => {
        if (!live) return;
        const merged: DeskKeys = { ...local };
        for (const id of ["justtcg", "pricecharting", "pokemontcg"] as const) {
          if (remote[id]) merged[id] = remote[id];
        }
        setKeys(merged);
        saveDeskKeys(merged);
      })
      .catch(() => {
        /* guest or table not ready — keep local */
      });
    return () => {
      live = false;
    };
  }, [user?.id, isPending]);

  function setKey(id: DeskKeyId, value: string) {
    setKeys((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }

  async function persist() {
    saveDeskKeys(keys);
    if (user) {
      setSyncing(true);
      try {
        await saveAccountKeys({ data: keys });
        toast("Keys saved on this device and to your account.");
      } catch {
        toast("Saved on this device. Sign in again to sync the account copy.");
      } finally {
        setSyncing(false);
      }
    } else {
      toast("Keys saved on this device. Sign in to keep them with your account.");
    }
    setSaved(true);
  }

  async function test(id: DeskKeyId) {
    const key = keys[id]?.trim();
    if (!key) {
      toast("Paste a key first.");
      return;
    }
    setTesting(id);
    try {
      const res = await testDeskKey({ data: { id, key } });
      toast(res.message);
    } catch {
      toast("Could not reach that desk.");
    } finally {
      setTesting(null);
    }
  }

  const n = countDeskKeys(keys);

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Settings</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Settings</h1>
      <section className="mt-8">
        <h2 className="font-display text-xl tracking-tight">Appearance</h2>
        <p className="mt-1 text-sm text-muted">Light, dark, or match this device.</p>
        <div className="mt-3">
          <AppearanceToggle />
        </div>
      </section>
      <h2 className="mt-10 font-display text-2xl tracking-tight">API desks</h2>
      <Lead>
        {user
          ? "Free desks run without a key.  Paid desks stay off until you paste one.  Keys are held in this browser, sent with each scan so the server can query those desks, and copied to your account (encrypted) when you save."
          : "Free desks run without a key.  Paid desks stay off until you paste one.  Keys are held in this browser and sent with each scan so the server can query those desks — sign in only if you want them on another browser or phone."}
      </Lead>
      <p className="mt-3 text-sm text-muted">
        {n} extra desk{n === 1 ? "" : "s"} enabled — {user ? "SIGNED IN" : "GUEST"}
      </p>
      {!user && !isPending && (
        <p className="mt-2 text-sm text-muted">
          <Link to="/login" className="text-fg underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to keep a backup in your account. The phone apps do not need this site to scan.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {DESK_KEY_META.map((desk) => (
          <article key={desk.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-medium tracking-tight">{desk.label}</h2>
                <a
                  href={desk.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-1 text-sm text-muted hover:text-fg"
                >
                  {desk.hrefLabel} <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="mt-1 text-sm text-muted">{desk.blurb}</p>
            </div>
            <div className="mt-4">
              <Label htmlFor={desk.id}>{desk.label} Key</Label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Input
                    id={desk.id}
                    type={show[desk.id] ? "text" : "password"}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={desk.placeholder}
                    value={keys[desk.id] ?? ""}
                    onChange={(e) => setKey(desk.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-fg"
                    onClick={() => setShow((s) => ({ ...s, [desk.id]: !s[desk.id] }))}
                    aria-label={show[desk.id] ? "Hide key" : "Show key"}
                  >
                    {show[desk.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => void test(desk.id)}
                  disabled={testing === desk.id}
                >
                  {testing === desk.id ? "Testing…" : "Test"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => void persist()} disabled={syncing}>
          {saved ? <Check /> : <KeyRound />}
          {saved ? "Saved" : user ? "Save to this device and account" : "Save on this device"}
        </Button>
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to scan
        </Link>
      </div>

      <aside className="mt-10 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-xl tracking-tight">Website vs phone apps</h2>
        <p className="mt-2 text-sm text-muted">
          Android and iPhone scan eBay, Mercari, TCGDex, and any paid desks you keyed — on the
          device.  A scan never sends a key; the only time one leaves the phone is if you tap
          Push Phone Keys to Account yourself.  This website is different: a
          scan here runs on our server, so the keys saved in this browser are sent with each scan
          request to query those desks.  Sign in on the phone only to copy keys from your
          account; after that the keys live on the phone.
        </p>
      </aside>
    </Shell>
  );
}
