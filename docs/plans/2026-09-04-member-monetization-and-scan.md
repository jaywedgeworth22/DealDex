# DealDex Member monetization, alerts, and scan plan

Updated: Fri, Sep 4, 2026.  Two spaces between sentences.  No agent names in product copy.

Owner direction captured for notes / plans / docs.  Not shipped yet.

## Product tiers

### Free

- Basic site browsing stays free.
- Scan is capped at **8 results**: **4 eBay + 4 Mercari**, first found.
- Cap applies on **website and apps**.
- Side effect: free scans finish faster (fewer marketplace rows to fetch and score).

### Member

- Name in product: **Member** (not “Premium” unless listing copy later says otherwise).
- Trial: **3 days**.
- Prices: **$3/mo**, **$20/yr**, **$45 lifetime**.
- Member unlocks:
  - Full scan depth (beyond the free 8).
  - Deal push notifications, including optional **time-sensitive / critical** alerts when the user opts in.
- Member edge is **speed**: well-priced or underpriced singles move fast; notification latency is the product.

## Auto-buy (later)

- Optional tools to automatically buy listings after a user has a **detailed saved search** running for about **7 days**.
- The warm-up exists so the user has time to see what the search finds before any auto-purchase is enabled.
- Auto-buy stays off by default until that gate is met and the user opts in.

## Scan cache (current behavior)

- Shared server cache for **free-desk** scans (`scan_cache`, ~8 minute freshness).
- Same query can reuse prior scored rows (listings + enrichment) across visitors.
- Scans that used **any paid desk keys** are **never** written to the shared cache (cross-user paid books must not leak).
- Browser / native also keep local in-memory / device caches for card match helpers.

Implication: if a scan is still slow on a cache miss (or after freshness expires), the bottleneck is almost always **marketplace fetch**, not enrichment.

## Marketplace fetch (current behavior)

DealDex does **not** call official eBay or Mercari seller APIs for live search today.  It uses a scrape ladder:

| Market | Order |
|--------|--------|
| eBay | Jina reader → Brave HTML → direct eBay HTML |
| Mercari | Jina reader → Brave HTML → DuckDuckGo HTML |

Mercari often blocks direct reads; empty Mercari usually means the ladder failed, not that there are zero cards.

### Planned: stronger backups

- Keep the scrape ladder, but add **stable backup connection methods** for both eBay and Mercari (official Browse / partner APIs where terms allow, or another durable mirror).
- Fail over automatically when Jina/Brave/HTML return empty or time out.
- Measure per-hop latency so Member alerts are not stuck behind a dead primary hop.

### Planned: listings coverage audit

Sometime soon, audit whether scans find **all relevant single-card Buy It Now listings**, or whether the query / filters cast too narrow a net.

- Keep specificity (singles, BIN, price floor, Pokémon/TCG cues).
- Check missed inventory: named-card hunts, set/number variants, title phrasing eBay/Mercari use that our parsers drop.
- Decide whether free’s “first 4+4” should still sample from a **wider fetch** then truncate, vs truncating the fetch itself (speed vs coverage tradeoff for free).

## Implementation notes (non-goals for this doc)

- Do not ship App Store / Play IAP from this note alone.
- Free 8-cap and Member paywall need StoreKit + Play Billing + web entitlement when built.
- Push criticality levels need explicit user opt-in copy (no surprise critical alerts).
- Auto-buy needs separate safety review (payment method on file, caps, cancel, marketplace ToS).

## Related

- `docs/store-listing.md` — current public listing copy.
- `migrations/0004_scan_cache.sql`, `src/lib/server/scan-cache.ts` — shared free scan cache.
- `src/lib/marketplaces/ebay.ts`, `mercari.ts`, `jina.ts`, `brave.ts` — fetch ladder.

## Cache policy (owner refinement 2026-09-04)

The shared free-desk window (~8 minutes) only avoids a full rematch for that short span.  Enrichment from appraisal / rating desks and other scored fields changes rarely.  Listing identity (title, URL, marketplace id) also changes rarely.

**Prefer:**

- Keep enrichment and stable listing fields for much longer (hours to a day, with a clear TTL).
- On revisit, primarily re-check **price** (and maybe shipping) against the marketplace.
- Treat a price change as the signal to refresh that row; leave card match / desk quotes alone unless stale by the long TTL or the user forces a full scan.

**Optional / low priority:**

- Detect whether a listing image changed **without** downloading the full image (for example ETag / Last-Modified / URL fingerprint).  May be more effort than reward; do not block Member or free-cap work on this.

