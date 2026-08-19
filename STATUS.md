# Current Handoff

## 2026-08-19 CURSOR — official DealDex wordmark (in-app / web)

Official title wordmark (red Deal + blue Dex, yellow badge) is the header,
login, Settings "Wordmark" chip, `public/marks/dd.svg`, and OG card.
Home-screen AppIcon / Android launcher / store 1024 are **not** in this
lane.  Jay will send a separate "DD" mark for those.

## 2026-08-18 CURSOR — iOS bundle ID `online.dealdex`

Switched the iOS target from `me.grok.dealdex` to `online.dealdex`.  Team
stays `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is documented
only — it is not a team id and must not appear in `DEVELOPMENT_TEAM`.
No TestFlight / ASC upload (Jay has not created the ASC app DealDex,
SKU `dealdex`).

# Status

Updated: 2026-08-19 (CURSOR — official wordmark, not the app icon)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat.  Prefix `grok-build/`.
- Public host: **https://dealdex.online** on **Grok's Vercel**.  GitHub
  `main` is the code.  dealdex.online is currently a stale Grok publish,
  not auto-building from `main`.  Re-link the Grok Vercel project to
  `jaywedgeworth22/DealDex`.  Do not use `jaywedgeworth22s-projects` for
  production.
- Native Android debug APK builds with the Gradle 8.7 wrapper.  Package
  remains `me.grok.dealdex`.
- iOS XcodeGen spec (`native/ios/project.yml`) uses
  `PRODUCT_BUNDLE_IDENTIFIER=online.dealdex` and
  `DEVELOPMENT_TEAM=CC8UTF7ATG`.  Apple App ID `online.dealdex` is
  registered (resource `R2FAW69NPD`, IAP on).
- In-app / web title mark is the official DealDex wordmark.  Home-screen
  icons are still the old delta / Grok placeholders until the DD icon
  lands.

## Blockers

- App Store Connect **app record** for `online.dealdex` (bundle ID is
  registered; App Manager API cannot CREATE apps).  Account Holder must
  add DealDex once (SKU `dealdex`).  Do not upload to TestFlight until
  that record exists.
- Home-screen AppIcon / Play launcher / PWA 180 wait on Jay's separate
  "DD" icon artwork.  Do not invent one from the wordmark.
- Google Play Console credentials are not in `~/.secrets/`.
- Custom domain **dealdex.online** is on Grok's Vercel but not tracking
  GitHub `main`.  Re-link the repo on that Grok project.
- Infisical project (prod env), `SENTRY_FLEET_DSN`, and
  `FLEET_GITHUB_TOKEN` still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.
- `xcodebuild` on the Mac can hang at Xcode 26's `clang -v` probe.
  Fallback: `swiftc` + `simctl` (see `native/ios/CLAUDE.md`).  This
  Linux preview cannot run Xcode 26.

## Next

- When Jay sends the home-screen "DD" mark: iOS AppIcon, Android
  adaptive launcher, favicon / apple-touch / PWA 180.
- TestFlight / ASC app record when the owner is ready (bundle
  `online.dealdex`, SKU `dealdex`, team `CC8UTF7ATG`).
- Remaining seats start from `main` in their own worktrees.
