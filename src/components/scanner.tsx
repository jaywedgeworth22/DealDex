import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LoaderCircle, Radar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { scanMarketplaces } from "@/lib/server/scan";
import { mercariSearchPage } from "@/lib/marketplaces/mercari";
import type { ScanSource, ScoredListing } from "@/lib/marketplaces/types";
import { collectHits } from "@/lib/alerts/match";
import { dispatchHits } from "@/lib/alerts/notify";
import { loadRules, pushHits } from "@/lib/alerts/store";
import { loadDeskKeys } from "@/lib/settings/keys";
import { verdictCopy } from "@/lib/tcg/appraise";
import type { Verdict } from "@/lib/tcg/types";
import { cardImageUrl, cn, formatUsd } from "@/lib/utils";
import { PriceRangeBar } from "@/components/price-range";
import { MarketplaceLogo, MarketplaceToggle } from "@/components/market-logo";
import { PriceSpark } from "@/components/price-spark";
import {
  formatAge,
  loadScanCache,
  peekListing,
  rememberListings,
  saveScanCache,
} from "@/lib/marketplaces/memory";

const CHIPS = [
  { label: "All Pokémon", q: "" },
  { label: "charizard", q: "charizard" },
  { label: "umbreon vmax", q: "umbreon vmax" },
  { label: "pikachu ex", q: "pikachu ex" },
  { label: "151", q: "151" },
  { label: "base set holo", q: "base set holo" },
  { label: "moonbreon", q: "moonbreon" },
];

type ViewFilter = "all" | "deals" | "verified" | "ebay" | "mercari";
type VerdictFilter = "any" | Verdict;
type PriceFilter = "any" | "25" | "50" | "100" | "250";
type ConditionFilter = "any" | "raw" | "graded";
type SpreadFilter = "any" | "10" | "20" | "40";
type FinishFilter = "any" | "holo" | "reverse" | "promo";

function verdictVariant(v: Verdict) {
  if (v === "steal" || v === "good") return "good" as const;
  if (v === "fair") return "fair" as const;
  return "bad" as const;
}

export function Scanner() {
  const [q, setQ] = useState("");
  const [sources, setSources] = useState<ScanSource[]>(["ebay", "mercari"]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ScoredListing[] | null>(null);
  const [meta, setMeta] = useState({ ebay: 0, mercari: 0, notes: [] as string[] });
  const [view, setView] = useState<ViewFilter>("all");
  const [verdict, setVerdict] = useState<VerdictFilter>("any");
  const [priceCap, setPriceCap] = useState<PriceFilter>("any");
  const [condition, setCondition] = useState<ConditionFilter>("any");
  const [spreadMin, setSpreadMin] = useState<SpreadFilter>("any");
  const [finish, setFinish] = useState<FinishFilter>("any");

  async function run(query = q, src = sources) {
    const term = query.trim();
    setLoading(true);
    setView("all");
    try {
      const res = await scanMarketplaces({
        data: { q: term, sources: src, keys: loadDeskKeys() },
      });
      setRows(res.rows);
      setMeta({ ebay: res.ebay, mercari: res.mercari, notes: res.notes });
      rememberListings(res.rows);
      saveScanCache({
        q: term,
        sources: src,
        at: new Date().toISOString(),
        rows: res.rows,
        meta: { ebay: res.ebay, mercari: res.mercari, notes: res.notes },
      });
      if (!res.rows.length) toast("No live listings right now. Try again in a minute.");
      const rules = loadRules();
      const hits = collectHits(res.rows, rules);
      if (hits.length) {
        pushHits(hits);
        void dispatchHits(hits, rules);
        toast(`${hits.length} alert${hits.length === 1 ? "" : "s"} matched this scan.`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cached = loadScanCache();
    if (cached) {
      setRows(cached.rows);
      setMeta(cached.meta);
      setQ(cached.q);
      if (cached.sources.length) setSources(cached.sources);
    }
    void run(cached?.q ?? "", cached?.sources ?? ["ebay", "mercari"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(src: ScanSource) {
    setSources((prev) => {
      const next = prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src];
      return next.length ? next : prev;
    });
  }

  const visible = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) => {
      if (view === "ebay") return row.listing.marketplace === "ebay";
      if (view === "mercari") return row.listing.marketplace === "mercari";
      if (view === "deals") {
        return row.appraisal?.verdict === "steal" || row.appraisal?.verdict === "good";
      }
      if (view === "verified") {
        const a = row.appraisal;
        return (
          !!a &&
          (a.verdict === "steal" || a.verdict === "good") &&
          !a.conflict &&
          a.confidence !== "low" &&
          a.sourcesUsed >= 2
        );
      }
      if (verdict !== "any" && row.appraisal?.verdict !== verdict) return false;
      if (priceCap !== "any" && (row.listing.price == null || row.listing.price > Number(priceCap))) {
        return false;
      }
      if (condition === "raw" && row.parsed.grade !== "raw") return false;
      if (condition === "graded" && row.parsed.grade === "raw") return false;
      if (spreadMin !== "any" && (row.appraisal?.spread == null || row.appraisal.spread < Number(spreadMin) / 100)) {
        return false;
      }
      if (finish !== "any") {
        const blob = `${row.listing.title} ${row.parsed.finishHint ?? ""}`.toLowerCase();
        if (!blob.includes(finish)) return false;
      }
      return true;
    });
  }, [rows, view, verdict, priceCap, condition, spreadMin, finish]);

  const dealCount =
    rows?.filter((r) => r.appraisal?.verdict === "steal" || r.appraisal?.verdict === "good").length ??
    0;
  const verifiedCount =
    rows?.filter(
      (r) =>
        r.appraisal &&
        (r.appraisal.verdict === "steal" || r.appraisal.verdict === "good") &&
        !r.appraisal.conflict &&
        r.appraisal.confidence !== "low" &&
        r.appraisal.sourcesUsed >= 2,
    ).length ?? 0;

  return (
    <section className="min-w-0 space-y-5">
      <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Live market scan</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Every live single, scored</h2>
          <div className="flex flex-wrap gap-2">
            {(["ebay", "mercari"] as const).map((src) => (
              <MarketplaceToggle
                key={src}
                marketplace={src}
                selected={sources.includes(src)}
                onClick={() => toggle(src)}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-pretty text-sm text-muted">
          Book is TCGPlayer, Cardmarket, TCGCSV, eBay solds, PriceCharting, and any keys in
          Settings. <span className="text-fg">Under</span> means cheaper than the middle of those
          desks. <span className="text-fg">× book</span> is how many times the ask is versus that
          middle — not a discount.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void run();
            }}
            placeholder="All Pokémon — or type a name to narrow"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="dealdex-scan"
            inputMode="search"
            className="sm:flex-1"
          />
          <Button onClick={() => void run()} disabled={loading} className="sm:w-40">
            {loading ? <LoaderCircle className="animate-spin" /> : <Radar />}
            {q.trim() ? "Scan Listings" : "Scan Market"}
          </Button>
        </div>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setQ(c.q);
                void run(c.q);
              }}
              className={cn(
                "h-11 shrink-0 rounded-full border px-3 text-xs transition-colors duration-150",
                q.trim().toLowerCase() === c.q
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border text-muted hover:bg-elevated hover:text-fg",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !rows && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {rows && (
        <>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-elevated p-1 sm:grid-cols-5">
            {(
              [
                ["all", `All ${rows.length}`],
                ["deals", `Deals ${dealCount}`],
                ["verified", `Verified ${verifiedCount}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  "h-11 rounded-md px-1 text-xs tabular-nums transition-colors duration-150",
                  view === key ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
            {(["ebay", "mercari"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-1.5 overflow-hidden rounded-md px-1 transition-colors duration-150",
                  view === key ? "bg-surface shadow-[var(--shadow-border)]" : "opacity-70 hover:opacity-100",
                )}
              >
                <MarketplaceLogo marketplace={key} />
                <span className="text-xs tabular-nums text-muted">
                  {key === "ebay" ? meta.ebay : meta.mercari}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Verdict"
              value={verdict}
              onChange={setVerdict}
              options={[
                ["any", "Any Verdict"],
                ["steal", "Steal"],
                ["good", "Good Deal"],
                ["fair", "Fair"],
                ["high", "High Ask"],
                ["avoid", "Overpriced"],
              ]}
            />
            <FilterSelect
              label="Max Ask"
              value={priceCap}
              onChange={setPriceCap}
              options={[
                ["any", "Any Price"],
                ["25", "Under $25"],
                ["50", "Under $50"],
                ["100", "Under $100"],
                ["250", "Under $250"],
              ]}
            />
            <FilterSelect
              label="Condition"
              value={condition}
              onChange={setCondition}
              options={[
                ["any", "Raw or Graded"],
                ["raw", "Raw Only"],
                ["graded", "Graded Only"],
              ]}
            />
            <FilterSelect
              label="Min Discount"
              value={spreadMin}
              onChange={setSpreadMin}
              options={[
                ["any", "Any vs Book"],
                ["10", "10%+ Under Book"],
                ["20", "20%+ Under Book"],
                ["40", "40%+ Under Book"],
              ]}
            />
            <FilterSelect
              label="Finish"
              value={finish}
              onChange={setFinish}
              options={[
                ["any", "Any Finish"],
                ["holo", "Holo"],
                ["reverse", "Reverse"],
                ["promo", "Promo"],
              ]}
            />
          </div>

          {meta.notes.length > 0 && (
            <p className="text-xs text-subtle">{meta.notes.join(" ")}</p>
          )}
          {!visible.length && (
            <div className="rounded-xl bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">
              {view === "mercari"
                ? "No Mercari hits leaked through. Use Open Mercari search, then paste a title here."
                : "Nothing in this filter. Widen the sliders, or scan the whole market."}
              {view === "mercari" && (
                <a
                  href={mercariSearchPage(q)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex h-11 items-center gap-1 text-sm text-fg"
                >
                  Open Mercari Search <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          )}
          <div className="grid min-w-0 gap-3">
            {visible.map((row) => (
              <ScanRow key={`${row.listing.marketplace}-${row.listing.id}`} row={row} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-subtle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {options.map(([v, name]) => (
          <option key={v} value={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScanRow({ row }: { row: ScoredListing }) {
  const { listing, card, appraisal } = row;
  const copy = appraisal ? verdictCopy(appraisal.verdict) : null;
  const thumb = listing.image || cardImageUrl(card?.image ?? null, "low");
  const ask = listing.price != null ? listing.price + listing.shipping : listing.price;
  const memory = peekListing(listing.marketplace, listing.id);
  const listed = formatAge(listing.listedAt ?? memory?.listedAt);
  const seen = formatAge(memory?.firstSeen);
  const ageLabel = listed ? `Listed ${listed}` : seen ? `Seen ${seen}` : null;
  const confidence =
    appraisal && appraisal.sourcesUsed >= 2
      ? appraisal.conflict
        ? "Desks Differ"
        : `${appraisal.confidence[0]!.toUpperCase()}${appraisal.confidence.slice(1)} · ${appraisal.sourcesUsed} Desks`
      : null;
  return (
    <article className="flex min-w-0 gap-3 overflow-hidden rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="h-[88px] w-16 shrink-0 rounded-sm bg-elevated object-cover"
        />
      ) : (
        <div className="grid h-[88px] w-16 shrink-0 place-items-center rounded-sm bg-elevated">
          <MarketplaceLogo marketplace={listing.marketplace === "ebay" ? "ebay" : "mercari"} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <MarketplaceLogo marketplace={listing.marketplace === "ebay" ? "ebay" : "mercari"} />
          {copy && appraisal && <Badge variant={verdictVariant(appraisal.verdict)}>{copy.label}</Badge>}
          {confidence && (
            <Badge
              variant={appraisal?.conflict ? "bad" : appraisal?.confidence === "high" ? "good" : "fair"}
              title={appraisal?.conflictDetail ?? appraisal?.verifyNote ?? undefined}
            >
              {confidence}
            </Badge>
          )}
        </div>
        <a href={listing.url} target="_blank" rel="noreferrer" className="mt-1 block">
          <h3 className="line-clamp-2 text-sm font-medium">{listing.title}</h3>
        </a>
        <p className="truncate text-xs text-subtle">
          {card ? `${card.name} · ${card.setName} #${card.localId}` : "No card match yet"}
        </p>
        {(ageLabel || (memory && memory.prices.length > 1)) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-subtle">
            {ageLabel && <span>{ageLabel}</span>}
            {memory && <PriceSpark ticks={memory.prices} />}
          </div>
        )}
        {appraisal?.conflict && appraisal.conflictDetail && (
          <p className="mt-1 text-xs text-deal-bad">{appraisal.conflictDetail}</p>
        )}
        {appraisal ? (
          <PriceRangeBar
            compact
            ask={ask ?? appraisal.allIn}
            book={appraisal.adjustedMarket}
            low={appraisal.rangeLow}
            high={appraisal.rangeHigh}
          />
        ) : (
          <p className="mt-2 font-mono text-sm tabular-nums">
            {formatUsd(listing.price)}
            <span className="text-xs text-subtle"> ask</span>
          </p>
        )}
        {card && (
          <Link
            to="/card/$cardId"
            params={{ cardId: card.id }}
            className="mt-1 inline-flex h-11 items-center text-sm text-muted hover:text-fg"
          >
            Card Dossier
          </Link>
        )}
      </div>
    </article>
  );
}
