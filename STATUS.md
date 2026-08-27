# Current Handoff

## 2026-08-27 CLAUDE — Landed and shipped: PR #203

Merged as `121ea10` (squash).  The push fired `ios-ship.yml` run #212 on
GitHub-hosted macOS, which compiled the Swift for the first time:
**`** ARCHIVE SUCCEEDED **`**.  `1.0.59 (202608272038)` is on TestFlight for
`net.dealdex`, build `f00d54b5-9552-41c5-b9d4-f414d2e8c30b`,
`internal=IN_BETA_TESTING`.

So the branch-long "Swift is compile-unverified" blocker is **closed for iOS**.
Swift autolinking pulled in VisionKit and AVFoundation with no `project.yml`
`dependencies:` entry — leave that file alone.

**Kotlin is still compile-unverified.**  There is no Android ship workflow, so
nothing has ever built `native/android` from this work.  Run
`./gradlew :app:assembleDebug :app:assembleRelease` on a machine with the SDK:
R8 is newly enabled, AGP was bumped, and `androidx.security:security-crypto` is
a new dependency.

**The scanner itself is still unproven.**  A green archive says it compiles, not
that it reads a card, and `DataScannerViewController` does not run in the
Simulator.  Nobody has yet pointed a real iPhone at a card.  Four-step device
check in `docs/rollouts/2026-08-27-ios-card-scanner.md`.

Two non-blocking loose ends from the ship: `project.yml` / `project.pbxproj`
still record `1.0.2 (202608230250)` while `1.0.59` shipped (they agree with each
other, so syncing needs `xcodegen generate` on a Mac), and release notes were a
DRY RENDER only — `IOS_TF_RELEASE_NOTES=1` is unset, so testers see the build
with no notes.

## 2026-08-27 CLAUDE — A real iOS card scanner

Owner asked whether the iOS app was updated and whether it has a real card
scanner.  Both answers were no: PR #203 is still a draft, so `main` and
TestFlight `1.0.2 (202608230250)` still carry the fake, and the 08-26 branch had
only **deleted** it.  This adds the replacement.

`CardScannerView` in `native/ios/DealDex/ScanView.swift` runs VisionKit
`DataScannerViewController` live text recognition on the camera feed, on the
device.  It cannot fake a result: `CardTextReader.query(from:)` returns `nil`
unless a name was actually read, the button then reads "No card name read yet"
and is disabled, and every recognised line is printed verbatim under the
viewfinder so a misread is visible before the user taps.  Unsupported hardware,
the Simulator, denied permission and `becameUnavailableWithError` each get their
own plain-language screen.  `NSCameraUsageDescription` added to **both**
`Info.plist` and `project.yml` — the plist alone would vanish on the next
`xcodegen generate`, and its absence is a hard crash on first camera use.

The scanner lives inside `ScanView.swift` deliberately: a new `.swift` file only
joins the target after `xcodegen generate` runs on a Mac, and hand-editing
`project.pbxproj` is forbidden.  Split it out when someone regenerates.

`npm test` 187/187 · typecheck clean · lint 0 errors · build green.

**STILL BLOCKED ON A MAC AND A PHONE:** the Swift is compile-unverified, and
`DataScannerViewController` does not run in the Simulator at all — the scanner
needs a physical iPhone before it can be called working.  Checklist in
`docs/rollouts/2026-08-27-ios-card-scanner.md`.

## 2026-08-26 CLAUDE — Full-app review remediation

Owner asked for a full evaluation of the website, backend, iOS app and Android
app, then for every finding to be fixed.  Branch
`claude/full-app-evaluation-893vtd`, based on `2440dc9`.

**The pattern behind almost every P0:** something was written down before it was
built and the writing was never revisited.  `/privacy` said the phone apps never
send desk keys to a DealDex server; both clients POSTed all three on every scan,
as the primary path.  iOS shipped a "Card & Slab Scanner" that reported
"Charizard 4/102" 1.2s after opening, with no `AVCaptureSession` in the target.
The Alerts page offered Email and SMS; the server recorded both as delivered
without attempting a send.

Fixed: on-device scanning is now primary and `/api/native/scan` **refuses** a
`keys` payload so the promise cannot regress; the website's server-side scan is
disclosed separately.  Native sign-in is PKCE — the `dealdex://` redirect
carries a single-use code, not a live session token any installed app could
claim.  Credentials moved to EncryptedSharedPreferences / Keychain,
`allowBackup=false`.  `desk_keys` encrypted at rest.  The valuation engine's
circular matcher, unreachable grade basis, within-desk "Desks Differ", and the
HP-stat-as-condition bug are all fixed on all three clients.  Android is on
targetSdk 35 with R8 and a signing config.  `npm ci` works again, so CI runs the
same install command `vercel.json` does.

`npm test` went from 97 source-grep guards to 155 including 51 that exercise
real prices — two of which caught bugs while being written.

An adversarial review of this branch caught that the FIRST version of the PKCE
fix did not work: binding the code to a challenge is useless when the challenge
is caller-supplied, and a `SameSite=Lax` cookie rides a top-level GET, so a
malicious app could mint itself a code in one request.  Leg 1 now issues a
single-use server-side `state` (`migrations/0007`) and the hand-off requires a
tap.  Residual risk is the private-use URI scheme itself — **App Links /
Universal Links is the next piece of native auth work**, blocked on a release
signing fingerprint and an entitlement change.

**BLOCKER FOR NATIVE SHIPS:** Swift and Kotlin are compile-unverified — that
session had no Xcode and no Android SDK.  Run `xcodegen generate`, both
`xcodebuild` and `./gradlew` builds, and a real-device sign-in before shipping
either app.  `CameraScannerView.swift`'s four `project.pbxproj` entries were
removed by hand; confirm a regenerate matches.  Full list in
`docs/rollouts/2026-08-26-full-app-review-remediation.md`, plus the scanner
checklist in `docs/rollouts/2026-08-27-ios-card-scanner.md`.

## 2026-08-25 ANTIGRAVITY — Configure Google/Apple/X OAuth & Polish Web Scan UI

- **OAuth Authentication Configuration**:
  - Wired provider resolution in `src/lib/auth/social.ts` to support all DealDex key aliases (`DD_WEB_GOOGLE_ID`, `DD_WEB_GOOGLE_SECRET`, `DEALDEX_X_CLIENT_ID`, `DEALDEX_X_CLIENT_SECRET`, `APPLE_CLIENT_ID`, etc.).
  - Placed Google client configs in native projects (`native/ios/DealDex/GoogleService-Info.plist` and `native/android/app/google-services.json`).
  - Added brand SVG icons and polished styling to the OAuth buttons on `/login`.
- **Web Scan UI Redesign**:
  - Replaced cramped scan bar with an integrated, high-contrast, prominent **⚡ SCAN MARKET** button featuring animated spinning state and a live scanning status banner.
  - Sized and padded eBay and Mercari source toggle buttons to render official logos with full proportions, active dot indicators, and live hit count badges.
  - Balanced 6-column filter controls (Verdict, Max Ask, Condition, Min Discount, Finish, and Hide Proxies switch) with clean Quick View tabs.
- **Verification & Native Builds**:
  - `npm test` (78/78 passing), `npm run lint` (0 errors), `npm run typecheck` (0 errors), and `npm run build` (clean production build).
  - iOS Simulator build verified with `xcodebuild` (**BUILD SUCCEEDED**).
  - Android debug APK verified with Gradle 8.7 (**BUILD SUCCESSFUL**) and copied to `public/DealDex.apk`.

## 2026-08-25 CURSOR — Pin AppUpdatePrompt.swift; move Apple IDs off Swift

One in-repo pin at `scripts/ios-fleet/AppUpdatePrompt.swift`, copied
byte-identical into `native/ios/DealDex/AppUpdatePrompt.swift`.  No
Swift package.  `knownAppleIds` (stale `online.dealdex`) is gone from
Swift.  Live bundle is `net.dealdex` appleId `6802474288` in
`scripts/ios-fleet/apps.json` and Info.plist `AppUpdateAppleId`.
Public manifest already has the same id on `net.dealdex` in
`jaywedgeworth22/ios-app-versions` `versions.json` (not rewritten here;
a one-app PUT would wipe siblings).  Did not treat `online.dealdex` as
live.  Did not upload `me.grok.dealdex`.  testers.json untouched.  No
`--force-ship`.  No spend.  KEEPOUT DealDex #183 Datadog / Vercel keys.
Branch `cursor/ios-app-update-prompt-pin-525d`.

## 2026-08-25 CURSOR — testers.json Comcast typo

`scripts/ios-fleet/testers.json` had `johnwedeworth@comcast.net`.  Spelling
is `johnwedgeworth@comcast.net`.  Left `mail@jays.services`.  Did not add
testers, expand invite-on-ship, change ios-ship, or use `--force-ship`.
Invite-on-ship comments/tests are not on `main` (only an unmerged leftover
on `cursor/android-pwa-update-alerts-c953`).  Remaining emails:
`johnwedgeworth@comcast.net`, `mail@jays.services`.  Branch
`cursor/testers-comcast-typo-160f`.

## 2026-08-25 CURSOR — Center iOS Scan empty-loading spinner

TestFlight Scan (2026-08-24) showed the gray spinner and
"Reading eBay and Mercari…" left of center in the empty results area.
`ScanView` parent `VStack` is `alignment: .leading`; the labeled
`ProgressView` had no `maxWidth` / center frame, so it hugged leading.
Now it uses `.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)`.
Caption unchanged.  No ship-path / runner / `--force-ship` change.
Branch `cursor/ios-scan-loading-center-1b16`.

## 2026-08-25 CURSOR — Android Play + PWA skippable update alerts

On-open update alert on Android (Play In-App Updates, flexible) and a
PWA “update available / reload” banner when a waiting service worker
exists.  Both are skippable (Update or Reload / Not Now).  Silent when
already current or the check fails.  iOS AppUpdatePrompt left as-is:
`knownAppleIds` already maps `net.dealdex`.  `versions.json` lives only
in `jaywedgeworth22/ios-app-versions` (DealDex `net.dealdex` still
`1.0.2` / `202608230250`).  Did not clone that repo or bump it.  Did
not touch `scripts/ios-fleet`, testers, invite-on-ship, or ios-ship YAML.
Branch `cursor/android-pwa-update-alerts-c953`.

## 2026-08-25 CURSOR — Accept dealdex in vendored ship-testflight.sh

ios-ship run 32791798491 imported signing on `macos-latest`, then Ship
failed with `unknown arg: dealdex`.  The wrapper always passes `dealdex`.
Vendored `scripts/ios-fleet/ship-testflight.sh` still only accepted
`socratic|congress|usage|usage-local` (copied from Congress.Trade).
`apps.json` already had the DealDex row (bundle `net.dealdex`, team
`CC8UTF7ATG`, SKU `dealdex`).  Added `dealdex` to the usage header and
positional case.  No `--force-ship`.  No secrets YAML.  Runner stays
GitHub-hosted `macos-latest`.  Branch `cursor/ios-ship-dealdex-case-5bfb`.

## 2026-08-24 CURSOR — GH-hosted macos-latest for iOS ship (protocol)

#170 wrongly restored a local Mac self-hosted runner.  Updated fleet protocol
bans that: iOS ships and all other Actions use GitHub-hosted runners
(`macos-latest` here).  Keep vendored `scripts/ios-fleet` (bundle
`net.dealdex`, train `1.0.N`).  Import ASC + Distribution secrets the same
way Congress.Trade does (`scripts/ios-appstore-gm-prepare.sh`).  Branch
`cursor/ios-gh-hosted-runners-709e`.

## 2026-08-24 CURSOR — Vendor ios-fleet so hosted ships can find 1.0.N

#165 landed the project regimen (`1.0.2` / `202608230250`).  #167 hosted
ships died because `/Users/jay/apps/ios-fleet` is not on `macos-latest`.
#170 vendored `scripts/ios-fleet`.  Do not send this job back to a local
Mac runner.

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

OG wordmark fills ~88% width, centered on white (logo only).  Re-render:
`node scripts/render-og.mjs`.  Cache-bust `og.jpg?v=logo-only-20260822`.


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

Updated: 2026-08-25 (CURSOR — pin AppUpdatePrompt.swift; Apple IDs off Swift)

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
  `PRODUCT_BUNDLE_IDENTIFIER=net.dealdex` and
  `DEVELOPMENT_TEAM=CC8UTF7ATG`.  Live ASC app is DealDex SKU `dealdex`
  appleId `6802474288`.  Resource `R2FAW69NPD` is the bundle App ID, not
  a team id.  Do not treat `online.dealdex` as live.  Do not upload
  `me.grok.dealdex`.  AppUpdatePrompt is pinned at
  `scripts/ios-fleet/AppUpdatePrompt.swift` and copied into the iOS
  target.  Apple IDs live in `apps.json` / `versions.json` / Info.plist
  `AppUpdateAppleId`, not a Swift `knownAppleIds` map.
- In-app / web title mark is the official DealDex wordmark (PR #86).
  Home-screen AppIcon / Android launcher / PWA 180 are the overlapping
  red + blue DD on the ST tiled field.  Tab favicon is the isolated DD
  on a transparent field.
- iOS TestFlight ship workflow (`.github/workflows/ios-ship.yml`) runs on
  GitHub-hosted `macos-latest`, calls `scripts/ios-ship-testflight.sh`
  (fleet key `dealdex`, in-repo `scripts/ios-fleet`), imports ASC +
  Distribution secrets via `scripts/ios-appstore-gm-prepare.sh`, and
  gates cron on `native/ios/` changes.

## Blockers

- Keepout: DealDex #183 Datadog / Vercel keys stay HOLD.  Do not land
  or extend that PR from this seat.
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
- TestFlight ships stay on GitHub-hosted `macos-latest` via
  `scripts/ios-ship-testflight.sh` (fleet key `dealdex`, bundle
  `net.dealdex`).  Do not `--force-ship` from this seat.
- Remaining seats start from `main` in their own worktrees.
