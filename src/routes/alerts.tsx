import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { defaultRule, type AlertRule } from "@/lib/alerts/types";
import { loadHits, loadRules, saveRules } from "@/lib/alerts/store";
import { ensureNativePermission } from "@/lib/alerts/notify";
import { isIos, isStandalone } from "@/lib/pwa";
import { cn, formatUsd } from "@/lib/utils";
import { labelSpread } from "@/lib/tcg/vs-book";
import { MarketplaceLogo, MarketplaceToggle } from "@/components/market-logo";
import { verdictCopy } from "@/lib/tcg/appraise";
import { Lead } from "@/components/lead";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>(() => loadRules());
  const hits = useMemo(() => loadHits(), [rules]);

  function persist(next: AlertRule[]) {
    setRules(next);
    saveRules(next);
  }

  function update(id: string, patch: Partial<AlertRule>) {
    persist(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Watchlist</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Alerts</h1>
      <Lead>
        Tell DealDex what a deal looks like. Native phone alerts fire on this device, and Pushover
        goes to the destination you add. Email and SMS are not wired up yet — they are listed so you
        can see what is coming, not so you can rely on them.
      </Lead>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const perm = await ensureNativePermission();
            if (perm === "unsupported") toast("This browser cannot show native alerts.");
            else if (perm === "denied") toast("Notifications are blocked in system settings.");
            else if (perm === "granted") toast("Native alerts are on for this device.");
            else toast("Permission saved.");
          }}
        >
          <Bell /> Enable Native Alerts
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/install">
            <Smartphone /> Install the Phone App
          </Link>
        </Button>
      </div>
      {isIos() && !isStandalone() && (
        <p className="mt-3 text-sm text-muted">
          On iPhone, add DealDex to the Home Screen first, then tap Enable Native Alerts from the
          icon.
        </p>
      )}

      <div className="mt-10 space-y-6">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onChange={(patch) => update(rule.id, patch)}
            onRemove={() => persist(rules.filter((r) => r.id !== rule.id))}
          />
        ))}
        <Button
          variant="secondary"
          onClick={() => {
            persist([...rules, defaultRule()]);
          }}
        >
          Add Alert
        </Button>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight">Recent Hits</h2>
        {!hits.length && <p className="mt-3 text-sm text-muted">No matches yet. Run a scan.</p>}
        <div className="mt-4 grid gap-3">
          {hits.map((hit) => (
            <a
              key={hit.id + hit.at}
              href={hit.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                {hit.marketplace === "ebay" || hit.marketplace === "mercari" ? (
                  <MarketplaceLogo marketplace={hit.marketplace} />
                ) : (
                  hit.marketplace
                )}
                {hit.verdict && <Badge variant="good">{hit.verdict}</Badge>}
                <span className="text-xs text-subtle">{hit.ruleName}</span>
              </div>
              <p className="mt-1 text-sm font-medium">{hit.title}</p>
              <p className="font-mono text-sm tabular-nums text-muted">
                {formatUsd(hit.price)} · {labelSpread(hit.spread)} · {hit.channels.join(", ")}
              </p>
            </a>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function RuleCard({
  rule,
  onChange,
  onRemove,
}: {
  rule: AlertRule;
  onChange: (patch: Partial<AlertRule>) => void;
  onRemove: () => void;
}) {
  return (
    <article className="space-y-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={rule.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="max-w-xs"
        />
        <label className="inline-flex h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          On
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-subtle">
            Keyword
          </span>
          <Input
            value={rule.keyword}
            placeholder="All Pokémon"
            onChange={(e) => onChange({ keyword: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-subtle">
            Max ask
          </span>
          <Input
            type="number"
            value={rule.maxPrice ?? ""}
            placeholder="No cap"
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-subtle">
            Min spread %
          </span>
          <Input
            type="number"
            value={rule.minSpread != null ? Math.round(rule.minSpread * 100) : ""}
            placeholder="12"
            onChange={(e) =>
              onChange({ minSpread: e.target.value ? Number(e.target.value) / 100 : null })
            }
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-subtle">
            Condition
          </span>
          <select
            value={rule.condition}
            onChange={(e) => onChange({ condition: e.target.value as AlertRule["condition"] })}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            <option value="any">Any</option>
            <option value="raw">Raw</option>
            <option value="graded">Graded</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["steal", "good", "fair"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              const has = rule.verdicts.includes(v);
              onChange({
                verdicts: has ? rule.verdicts.filter((x) => x !== v) : [...rule.verdicts, v],
              });
            }}
            className={`h-11 rounded-full px-3 text-xs ${
              rule.verdicts.includes(v) ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
            }`}
          >
            {verdictCopy(v).label}
          </button>
        ))}
        {(["ebay", "mercari"] as const).map((m) => (
          <MarketplaceToggle
            key={m}
            marketplace={m}
            selected={rule.marketplaces.includes(m)}
            onClick={() => {
              const has = rule.marketplaces.includes(m);
              const next = has
                ? rule.marketplaces.filter((x) => x !== m)
                : [...rule.marketplaces, m];
              if (next.length) onChange({ marketplaces: next });
            }}
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Channel
          label="Native phone (Android / iOS)"
          checked={rule.channels.native}
          onChange={(native) => onChange({ channels: { ...rule.channels, native } })}
        />
        {/*
          Email and SMS have no provider behind them. They were previously
          toggleable and the server recorded every one as delivered, so a user
          could switch on SMS alerts and silently never receive any. Disabled
          until a provider is wired up.
        */}
        <Channel
          label="Email"
          checked={false}
          onChange={() => undefined}
          disabled
          note="Not available yet"
        />
        <Channel
          label="SMS"
          checked={false}
          onChange={() => undefined}
          disabled
          note="Not available yet"
        />
        <Channel
          label="Pushover"
          checked={rule.channels.pushover}
          onChange={(pushover) => onChange({ channels: { ...rule.channels, pushover } })}
        />
        {rule.channels.pushover && (
          <>
            <Input
              placeholder="Pushover user key"
              value={rule.pushoverUser}
              onChange={(e) => onChange({ pushoverUser: e.target.value })}
            />
            <Input
              placeholder="Pushover API token"
              value={rule.pushoverToken}
              onChange={(e) => onChange({ pushoverToken: e.target.value })}
            />
          </>
        )}
      </div>
      <button type="button" onClick={onRemove} className="h-11 text-sm text-muted hover:text-fg">
        Remove
      </button>
    </article>
  );
}

function Channel({
  label,
  checked,
  onChange,
  disabled,
  note,
}: {
  disabled?: boolean;
  note?: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-11 items-center gap-2 text-sm",
        disabled ? "cursor-not-allowed text-subtle" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
      {note && <span className="text-xs text-subtle">({note})</span>}
    </label>
  );
}
