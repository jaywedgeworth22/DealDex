# Current Handoff

## 2026-08-20 CURSOR — Apache License 2.0 at repo root

Root `LICENSE` is the official Apache License, Version 2.0 text from
https://www.apache.org/licenses/LICENSE-2.0.txt with
`Copyright 2026 Jay Wedgeworth` on the first line.  README has no
license section, so it was left alone.  PR to `main`; do not merge from
this seat.

## 2026-08-19 CURSOR — official DD AppIcon + TestFlight rejects

Home-screen icon is the overlapping glossy red + blue DD with a thick yellow
rim (white background).  iOS now has `Assets.xcassets/AppIcon`,
`CFBundleIconName=AppIcon`, and iPad orientations include PortraitUpsideDown
(Apple 90474).  Android adaptive/mipmap launcher and web favicon + PWA 180
use the same DD.  In-app wordmark is already on `main` (PR #86) — do not
replace it with this DD.

## 2026-08-19 CURSOR — official DealDex wordmark (in-app / web)

Official title wordmark (red Deal + blue Dex, yellow badge) is the header,
login, Settings "Wordmark" chip, `public/marks/dd.svg`, and OG card
(merged PR #86).

## 2026-08-18 CURSOR — iOS bundle ID `online.dealdex`

Switched the iOS target from `me.grok.dealdex` to `online.dealdex`.  Team
stays `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is documented
only — it is not a team id and must not appear in `DEVELOPMENT_TEAM`.
No TestFlight / ASC upload (Jay has not created the ASC app DealDex,
SKU `dealdex`).

# Status

Updated: 2026-08-20 (CURSOR — Apache License 2.0)

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
  remains `me.grok.dealdex`.  Launcher is the official DD.
- iOS XcodeGen spec (`native/ios/project.yml`) uses
  `PRODUCT_BUNDLE_IDENTIFIER=online.dealdex` and
  `DEVELOPMENT_TEAM=CC8UTF7ATG`.  Apple App ID `online.dealdex` is
  registered (resource `R2FAW69NPD`, IAP on).  AppIcon catalog is wired;
  `CFBundleIconName` is `AppIcon`.
- In-app / web title mark is the official DealDex wordmark (PR #86).
  Home-screen AppIcon / Android launcher / PWA 180 are the overlapping
  red + blue DD (this PR).

## Blockers

- App Store Connect **app record** for `online.dealdex` (bundle ID is
  registered; App Manager API cannot CREATE apps).  Account Holder must
  add DealDex once (SKU `dealdex`).  Do not upload to TestFlight until
  that record exists.
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

- Land the DD AppIcon PR, then archive on a Mac once the ASC app record
  exists (bundle `online.dealdex`, SKU `dealdex`, team `CC8UTF7ATG`).
- Remaining seats start from `main` in their own worktrees.
