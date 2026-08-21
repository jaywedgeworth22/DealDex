# 2026-08-21 — Scan layout, OG wordmark width, new subtitle

Owner: compact the market scan box, drop suggested Pokémon chips, put listing
counts on one large eBay/Mercari pair, two listings per row on desktop/iPad,
and change the subtitle everywhere to Identify Best-Priced Pokémon Card
Listings.  OG DealDex mark should fill 2/3 to 3/4 of the share card.

## What landed

- `src/lib/copy.ts` — `APP_SUBTITLE`
- Site hero, login, OG description, README, AGENTS.md, store listing, iOS
  `DealDexCopy.subtitle`, Android `app_subtitle`
- `scripts/og-dealdex.html` — wordmark `width: 840px` (70%), `max-width: 75%`
- Web scanner: no chips; large source toggles with counts; All/Deals/Verified
  plus five compact filters in the same card; `md:grid-cols-2` listing grid
- iOS ScanView and Android ScanScreen match that chrome; iPad/tablet is 2-up
- App Store 30-character subtitle field is `Best-priced card listings` because
  the full phrase is 43 characters

## Verify

```
npm run lint && npm run typecheck && npm test && npm run build
node scripts/render-og.mjs
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```
