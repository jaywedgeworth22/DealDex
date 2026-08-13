import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, Radar } from "lucide-react";
import { scanMarketplaces } from "@/lib/server/scan";
import type { ScoredListing } from "@/lib/marketplaces/types";
import { cn, formatUsd } from "@/lib/utils";
import { labelSpread } from "@/lib/tcg/vs-book";
import { MarketplaceLogo } from "@/components/market-logo";

type Platform = "android" | "ios";

export function NativePhones() {
  const [platform, setPlatform] = useState<Platform>("android");
  const [tab, setTab] = useState<"scan" | "alerts">("scan");
  const [rows, setRows] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    void scanMarketplaces({ data: { q: "", sources: ["ebay", "mercari"] } })
      .then((res) => {
        if (live) setRows(res.rows);
      })
      .catch(() => {
        if (live) setRows([]);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setPlatform("android")}
          className={cn(
            "h-11 rounded-md px-4 text-sm",
            platform === "android" ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
          )}
        >
          Android
        </button>
        <button
          type="button"
          onClick={() => setPlatform("ios")}
          className={cn(
            "h-11 rounded-md px-4 text-sm",
            platform === "ios" ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
          )}
        >
          iPhone
        </button>
      </div>
      <div className="flex justify-center sm:justify-start">
        <PhoneChrome platform={platform}>
          {tab === "scan" ? (
            <ScanPane platform={platform} rows={rows} loading={loading} />
          ) : (
            <AlertsPane platform={platform} />
          )}
          <nav
            className={cn(
              "mt-auto grid grid-cols-2 border-t border-border bg-surface",
              platform === "ios" ? "rounded-b-xl" : "rounded-b-lg",
            )}
          >
            <button
              type="button"
              onClick={() => setTab("scan")}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
                tab === "scan" ? "text-accent" : "text-muted",
              )}
            >
              <Radar className="size-4" />
              Scan
            </button>
            <button
              type="button"
              onClick={() => setTab("alerts")}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
                tab === "alerts" ? "text-accent" : "text-muted",
              )}
            >
              <Bell className="size-4" />
              Alerts
            </button>
          </nav>
        </PhoneChrome>
      </div>
    </div>
  );
}

function PhoneChrome({ platform, children }: { platform: Platform; children: ReactNode }) {
  const ios = platform === "ios";
  return (
    <div
      className={cn(
        "w-full max-w-xs shrink-0 bg-fg p-2 shadow-[var(--shadow-border)]",
        ios ? "rounded-xl" : "rounded-lg",
      )}
    >
      <div
        className={cn(
          "flex h-[34rem] flex-col overflow-hidden bg-bg",
          ios ? "rounded-lg" : "rounded-md",
        )}
      >
        <div className="flex h-8 items-center justify-between px-4 text-xs text-muted">
          <span>9:41</span>
          {ios ? <span className="h-4 w-20 rounded-full bg-fg/80" /> : <span className="font-mono">DealDex</span>}
          <span>{ios ? "5G" : "LTE"}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ScanPane({
  platform,
  rows,
  loading,
}: {
  platform: Platform;
  rows: ScoredListing[];
  loading: boolean;
}) {
  const deals = useMemo(
    () => rows.filter((r) => r.appraisal?.verdict === "steal" || r.appraisal?.verdict === "good"),
    [rows],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-2">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Pokémon listing desk</p>
      <h2 className="mt-0.5 font-display text-xl leading-tight tracking-tight">Find the best listings.</h2>
      <p className="mt-1 text-xs text-muted">Scans eBay and Mercari on this phone.</p>
      <div className="mt-2 flex gap-1.5 overflow-x-auto">
        {(["All Pokémon", "Deals"] as const).map((label, i) => (
          <span
            key={label}
            className={cn(
              "shrink-0 px-2.5 py-1 text-xs",
              platform === "ios" ? "rounded-full" : "rounded-sm",
              i === 0 ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
            )}
          >
            {label}
            {label === "Deals" ? ` ${deals.length}` : ""}
          </span>
        ))}
        {(["ebay", "mercari"] as const).map((m) => (
          <span
            key={m}
            className={cn(
              "inline-flex shrink-0 items-center px-2.5 py-1",
              platform === "ios" ? "rounded-full" : "rounded-sm",
              "bg-elevated",
            )}
          >
            <MarketplaceLogo marketplace={m} className="h-3" />
          </span>
        ))}
      </div>
      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {loading && <p className="py-8 text-center text-xs text-muted">Reading eBay and Mercari…</p>}
        {!loading &&
          rows.slice(0, 8).map((row) => {
            const v = row.appraisal?.verdict;
            const tone =
              v === "steal" || v === "good"
                ? "text-deal-good"
                : v === "high" || v === "avoid"
                  ? "text-deal-bad"
                  : "text-deal-fair";
            return (
              <article
                key={row.listing.marketplace + row.listing.id}
                className={cn(
                  "bg-surface p-2.5 shadow-[var(--shadow-border)]",
                  platform === "ios" ? "rounded-xl" : "rounded-md",
                )}
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-subtle">
                  <MarketplaceLogo
                    marketplace={row.listing.marketplace === "ebay" ? "ebay" : "mercari"}
                    className="h-3"
                  />
                  {v && <span className={tone}>{v}</span>}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug">{row.listing.title}</p>
                {row.card && (
                  <p className="mt-0.5 text-xs text-muted">
                    {row.card.name} · {row.card.setName} #{row.card.localId}
                  </p>
                )}
                <p className="mt-1 font-mono text-xs">
                  {formatUsd(row.listing.price)} ask
                  <span className="mx-1.5 text-subtle">·</span>
                  {formatUsd(row.appraisal?.adjustedMarket)} book
                  <span className={cn("ml-1.5", tone)}>{labelSpread(row.appraisal?.spread)}</span>
                </p>
              </article>
            );
          })}
      </div>
    </div>
  );
}

function AlertsPane({ platform }: { platform: Platform }) {
  return (
    <div className="flex-1 px-3">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Alerts</p>
      <h2 className="font-display text-xl tracking-tight">Native deal pings</h2>
      <p className="mt-2 text-xs text-muted">Pings on this phone after each scan.</p>
      <div
        className={cn(
          "mt-4 space-y-3 bg-surface p-3 text-xs shadow-[var(--shadow-border)]",
          platform === "ios" ? "rounded-xl" : "rounded-md",
        )}
      >
        <p>
          Name
          <span className="mt-1 block text-muted">Steals under $100</span>
        </p>
        <p>
          Keyword
          <span className="mt-1 block text-muted">All Pokémon</span>
        </p>
        <p>
          Min spread
          <span className="mt-1 block text-muted">12%</span>
        </p>
      </div>
    </div>
  );
}
