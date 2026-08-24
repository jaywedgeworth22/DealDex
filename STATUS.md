# Current Handoff

## 2026-08-23 CURSOR — iOS version regimen (1.0.N + UTC build)

DealDex ASC showed `1.0 (1)` because `CURRENT_PROJECT_VERSION` was stuck at `1`
while marketing was `1.0.2`.  Fleet regimen: marketing `1.0.<seq>`, build UTC
`YYYYMMDDHHMM` so ASC reads `1.0.2 (202608230250)`.  `project.yml`, `pbxproj`,
`CLAUDE.md`, and `ios-identity.test.mjs` updated.  Next Mac `ios-ship` run
ships the next patch via `ios-fleet/ship-testflight.sh`.  Branch
`cursor/ios-version-regimen-709e`.

## 2026-08-22 CURSOR — Publish native apps against dealdex.net

Android Scan now POSTs to `https://dealdex.net/api/native/scan` first (same unsigned website scoring as iOS), then falls back to on-device scrape.  Scan chrome matches the site: SCAN, filters, Hide proxies, All/Deals/Verified.  Sideload APK is `public/DealDex.apk` (versionName 1.0.2).  iOS already used the website; TestFlight ship uses bundle `net.dealdex`.  Branch `cursor/native-publish`.

## 2026-08-22 CURSOR — OG logo-only card

Social sharing image (`public/og.jpg`) is logo-only: centered DealDex wordmark
fills ~88% width on white, no subtitle or footer.  Re-render:
`node scripts/render-og.mjs`.  Cache-bust `og.jpg?v=logo-only-20260822`.
Branch `cursor/og-logo-only-4780`.

## 2026-08-22 CURSOR — Vercel Speed Insights

Mount `@vercel/speed-insights` on the TanStack Start root
(`@vercel/speed-insights/react` + `computeRoute`, not the Next.js import).
Service worker already skips `/_vercel/` so vitals beacons are not intercepted.
Privacy page discloses cookie-less Core Web Vitals.  After merge, Vercel
Production on `dealdex.net` collects FCP/LCP/INP/CLS.  Branch
`cursor/vercel-speed-insights-4a42`.

## 2026-08-22 ANTIGRAVITY — DealDex.net domain, net.dealdex bundle ID, iOS 17.0, and icon sync

- **Domain & GitHub**: DealDex.net is the official canonical domain name (`dealdex.online` 301 redirects to `.net`).  Updated GitHub repo details (`homepageUrl: https://dealdex.net`) and all docs.
- **Icons & Brand**: Updated master brand assets from owner uploads.  iOS AppIcon uses the subtle tiled silver grid DD; website favicon, Android launcher mipmaps/adaptive icons, and PWA icon use the isolated transparent DD; 3D DealDex title wordmark updated across web, iOS, and Android.
- **iOS Xcode & Bundle**: Switched bundle identifier to `net.dealdex` (`PRODUCT_BUNDLE_IDENTIFIER`, `bundleId`, `CFBundleIdentifier`).  Deployment target set to **iOS 17.0** (Xcode document format 26.3 / objectVersion 100).  Display name `DealDex`, team `CC8UTF7ATG`, category `public.app-category.shopping`.
- **Native Builds**: iOS Simulator build (**BUILD SUCCEEDED**), Android debug APK built (**BUILD SUCCESSFUL**) and copied to `public/DealDex.apk`.
- **Fleet Protocols**: Updated `AGENT-SYNC.md` with typography, line spacing (1.5x body, 2.0x section breaks), and table/diagram aesthetics standards for Apple Notes.

## 2026-08-22 GROK — Public host dealdex.net

Owner registered `dealdex.net` (Namecheap).  Canonical website host is
`https://dealdex.net`.  iOS bundle stays `online.dealdex`.  Android stays
`me.grok.dealdex`.  `dealdex.online` redirects to `.net` once both names are
on the Vercel project.  Branch `grok/dealdex-net`.  Board `b16e5c74`.

Need owner: Vercel project Domains → add `dealdex.net` (and www).  Then
Namecheap Advanced DNS for `dealdex.net` using the records Vercel prints
(same screen as `dealdex.online`).

## 2026-08-22 GROK — Scan box contrast + SCAN label

Portrait web layout kept.  Filter headings and select values are centered.
LIVE MARKET SCAN is nudged 1ch right.  The brown button is SCAN at 2.5x
with no radar icon.  Hide Proxies has no REPACKS label and no bubble
border.  Muted/subtle/border tokens are darker for AA.  Phone Account
Website already defaults to https://dealdex.online.  Native iOS ScanView
matches the web filters and SCAN button.  Branch `grok/scan-row-contrast`.
Board `952f57b3`.

## 2026-08-22 GROK — Scan desk + Android/PWA isolated DD

Scan is dark brown, full width of the eBay/Mercari column, with those
toggles under it.  Six filters sit 3-per-row to the left.  Android and
PWA 180 use the isolated transparent DD.  iOS AppIcon stays the tiled
1024 PNG.  Branch `grok/dd-android-pwa-transparent`.

## 2026-08-22 GROK — Tighter DD AppIcon

AppIcon is the owner 1024 DD PNG, resized to iOS/Android/PWA slots.
Favicon is the isolated transparent DD.  Branch `grok/dd-appicon-tight`.

## 2026-08-22 GROK — Vercel Web Analytics

Mount `@vercel/analytics` on the TanStack Start root (`@vercel/analytics/react`, not the Next.js import).  Service worker skips `/_vercel/` so insight beacons are not intercepted.  Privacy page discloses cookie-less page-view counting.  After merge, Vercel Production on `dealdex.online` collects visits.  Branch `grok/vercel-analytics`.

## 2026-08-21 ANTIGRAVITY — Cross-Platform Power Enhancements (#119)

Cross-platform power valuation engine, Mobile Card Dossier, Evaluator desk, Saved Appraisals ledger, and camera OCR integration across Web, iOS, and Android.

- **Web Appraisal Engine**: Added PSA 10 and PSA 9 grading arbitrage calculator, net margin % factoring seller fees, proxy/repack heuristic banner & filter toggle, and 1-tap "Share Deal" clipboard badge.
- **Native iOS Parity**:
  - `CardDossierView.swift`: High-res artwork, multi-finish pricing, Cardmarket EUR comps, direct deep links to TCGPlayer, eBay Solds, and Mercari.
  - `EvaluatorView.swift`: Interactive ad-hoc listing calculator with condition/grade selectors, net flip margin, and PSA grading arbitrage matrix.
  - `SavedStore.swift` + `SavedView.swift`: Saved Appraisals ledger persisting portfolio deals with status (`Watching`, `Bought`, `Passed`) to `UserDefaults`.
  - `CameraScannerView.swift`: Vision-based OCR camera scanner extracting card names/numbers and opening directly in Evaluator.
  - Updated `DealDexApp.swift` TabView with Scan, Evaluator, Saved, Alerts, and Settings tabs.
- **Native Android Parity**:
  - `CardDossierScreen.kt`, `EvaluatorScreen.kt`, and `SavedScreen.kt` Jetpack Compose screens.
  - Bottom navigation bar updated with Scan, Evaluator, Saved, Alerts, and Settings.
  - Direct Card Dossier navigation and save-to-ledger actions added to `ListingCard`.
- **Build & Test Verification**:
  - Web: `npm run lint` (0 errors), `npm run typecheck` (0 errors), `npm test` (72/72 passing), `npm run build` (clean Vercel build).
  - iOS: `xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex -destination 'generic/platform=iOS Simulator' build` (**BUILD SUCCEEDED**).
  - Android: `gradlew :app:assembleDebug` with OpenJDK 17 & Android SDK 34 (**BUILD SUCCESSFUL**).

## 2026-08-21 CURSOR — scan layout, OG wordmark, subtitle (#118 / #117)

Merged squash `5474ef1`.  User-facing subtitle is **Identify Best-Priced Pokémon Card Listings** on the
site, login, OG card, iOS, Android, store listing (in-app; App Store 30-char
field is `Best-priced card listings`), and README.

Scan box: no suggested Pokémon chips.  One large eBay/Mercari pair with listing
counts on the toggles (those are the scan sources; no second filter pair).
All / Deals / Verified plus compact filter selects stay in the same card.
Desktop and iPad show two listing cards per row (`md:grid-cols-2`, iOS
`horizontalSizeClass == .regular`, Android `screenWidthDp >= 600`).

<<<<<<< HEAD
OG share card: 1160px centered wordmark, 52px subtitle
("Find the best-priced Pokémon card listings"), DealDex.net between eBay and Mercari.
Re-render: `node scripts/render-og.mjs`.  Cache-bust `og.jpg?v=share-20260823c`.
=======
OG wordmark fills ~88% width, centered on white (logo only).  Re-render:
`node scripts/render-og.mjs`.  Cache-bust `og.jpg?v=logo-only-20260822`.
>>>>>>> 27df8dd (OG social card: logo-only centered wordmark)


## 2026-08-20 CURSOR — transparent DD favicon + ST-grid AppIcon

Safari tab icon is a transparent interlocking DD (`favicon.ico` /
`favicon-32.png`), not the old SVG that showed a letter tile.  Header
wordmark no longer has a rectangular `img` outline.  iOS AppIcon is the
DD on the Socratic.Trade tiled field (soft top-left light, recessed
grout, no candlesticks).  Rebuild: `python3 scripts/generate-app-icons.py`.

## 2026-08-21 GROK — merge origin/main into iOS TestFlight ship workflow (#85)

Union of the TestFlight ship-workflow handoff and the 3D title / iOS desk
handoff.  Workflow contract unchanged.  No TestFlight upload from this seat.

## 2026-08-20 GROK — rebase iOS TestFlight ship workflow (#85)

Added `.github/workflows/ios-ship.yml` plus a scheduled-ship gate so cron
cannot ship web-only commits.  Path filter is `native/ios/**`.  Fleet app
key is `dealdex`.  Runner `[self-hosted, macOS, ARM64, xcode26]`.  Secrets
stay on the Mac.  Bundle `online.dealdex` and team `CC8UTF7ATG` are
unchanged.  Android package `me.grok.dealdex` is unchanged.  This seat
does not upload to TestFlight.  Rebased onto current `main`.  PR #85.

## 2026-08-20 GROK — 3D title wordmark + iOS desk

Jay's glossy 3D DealDex title (red Deal + blue Dex, yellow rim) is the
website header, login, OG card, iPhone Scan title, and Android Scan title.
Isolated interlocking DD is stored at `public/marks/dealdex-dd.png` and
`DealDexMark.imageset`.  **Live AppIcon is unchanged** (white-field DD).
Preview icon options stay in `native/brand/icon-options/`.

iOS desk (same lane): display name DealDex, iOS 18.0, Xcode 26.3
(objectVersion 100), official white eBay/Mercari SVG chips, unsigned
`POST /api/native/scan`, Sign in with Google via `dealdex://` OAuth.

## 2026-08-20 CURSOR — shipping docs + GitHub About

Vercel is the current host, not a leftover.  Public host is
**https://dealdex.online**.  GitHub About homepage is that URL, not
`dealdex-psi.vercel.app`.  Repo is **public**.  Keep the site on Vercel.
Do not migrate copy to Coolify.  Native: Android `me.grok.dealdex`, iOS
`online.dealdex`, team `CC8UTF7ATG`.  Docs only.

## 2026-08-20 CURSOR — Apache License 2.0 at repo root

Root `LICENSE` is the official Apache License, Version 2.0 text from
https://www.apache.org/licenses/LICENSE-2.0.txt with
`Copyright 2026 Jay Wedgeworth` on the first line.  Landed as PR #94.

## 2026-08-19 CURSOR — official DD AppIcon + TestFlight rejects

Home-screen icon is the overlapping glossy red + blue DD with a thick yellow
rim (white background).  iOS has `Assets.xcassets/AppIcon`,
`CFBundleIconName=AppIcon`, and iPad orientations include PortraitUpsideDown
(Apple 90474).  Android adaptive/mipmap launcher and web favicon + PWA 180
use the same DD.  In-app wordmark stays the official title mark (PR #86).
Landed as PR #87.

## 2026-08-19 CURSOR — official DealDex wordmark (in-app / web)

Official title wordmark (red Deal + blue Dex, yellow badge) is the header,
login, Settings "Wordmark" chip, `public/marks/dd.svg`, and OG card
(merged PR #86).

## 2026-08-18 CURSOR — iOS bundle ID `online.dealdex`

Switched the iOS target from `me.grok.dealdex` to `online.dealdex`.  Team
stays `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is documented
only.  It is not a team id and must not appear in `DEVELOPMENT_TEAM`.
No TestFlight / ASC upload (Jay has not created the ASC app DealDex,
SKU `dealdex`).

# Status

Updated: 2026-08-21 (CURSOR — #118 deployed, scan layout + subtitle)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (public).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat.  Prefix `grok-build/`.
- Website is optional.  Stack is React 19, TanStack Start, Tailwind v4,
  Better Auth, Vite.  Not Next.js / Expo / React Native / Capacitor.
- **Public host: https://dealdex.online on Vercel.**  Vercel is current,
  not a leftover.  GitHub About homepage is `https://dealdex.online`.
  Do not point About at `dealdex-psi.vercel.app`.  Do not migrate the
  site to Coolify.
- GitHub `main` is the code.  Vercel Production builds it (team
  `jaywedgeworth22s-projects`, project `dealdex`).  Checked 2026-08-20:
  `https://dealdex.online` served the same hashed JS as the GitHub-linked
  alias `https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app`.
  The older "stale Grok publish, not tracking `main`" gap is not visible
  in today's GET.  Both pages still load
  `grok.com/grok-app-builder/extensions.js` (Grok publish chrome).
- `https://dealdex.vercel.app` is a different Next.js product.  Do not
  use it.
- Native Android debug APK builds with the Gradle 8.7 wrapper.  Package
  remains `me.grok.dealdex`.  Launcher is the official DD.
- iOS XcodeGen spec (`native/ios/project.yml`) uses
  `PRODUCT_BUNDLE_IDENTIFIER=online.dealdex` and
  `DEVELOPMENT_TEAM=CC8UTF7ATG`.  Apple App ID `online.dealdex` is
  registered (resource `R2FAW69NPD`, IAP on).  AppIcon catalog is wired;
  `CFBundleIconName` is `AppIcon`.
- In-app / web title mark is the official DealDex wordmark (PR #86).
  Home-screen AppIcon / Android launcher / PWA 180 are the overlapping
  red + blue DD on the ST tiled field.  Tab favicon is the isolated DD
  on a transparent field.
- iOS TestFlight ship workflow (`.github/workflows/ios-ship.yml`) runs on
  `[self-hosted, macOS, ARM64, xcode26]`, calls
  `scripts/ios-ship-testflight.sh` (fleet key `dealdex`), and gates cron
  on `native/ios/` changes.  Secrets stay on the Mac.

## Blockers

- App Store Connect **app record** for `online.dealdex` (bundle ID is
  registered; App Manager API cannot CREATE apps).  Account Holder must
  add DealDex once (SKU `dealdex`).  Do not upload to TestFlight until
  that record exists.
- Google Play Console credentials are not in `~/.secrets/`.
- Infisical project (prod env), `SENTRY_FLEET_DSN`, and
  `FLEET_GITHUB_TOKEN` still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.
- `xcodebuild` on the Mac can hang at Xcode 26's `clang -v` probe.
  Fallback: `swiftc` + `simctl` (see `native/ios/CLAUDE.md`).  This
  Linux preview cannot run Xcode 26.

## Next

- Keep the public host on Vercel at `https://dealdex.online`.  Do not
  move copy to Coolify.
- TestFlight / ASC app record when the owner is ready (bundle
  `online.dealdex`, SKU `dealdex`, team `CC8UTF7ATG`).  After that record
  exists, the Mac `ios-ship` workflow (or
  `bash scripts/ios-ship-testflight.sh --force-ship`) can upload.
- Remaining seats start from `main` in their own worktrees.
