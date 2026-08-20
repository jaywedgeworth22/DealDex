# Current Handoff

## 2026-08-20 CURSOR — shipping docs + GitHub About

README, CONTRIBUTING, PLAN, AGENTS, copilot-instructions, store listing,
and this file now match how DealDex actually ships: optional TanStack /
Vite website plus native Android (`me.grok.dealdex`) and iOS
(`online.dealdex`, team `CC8UTF7ATG`).  GitHub About homepage
`https://dealdex-psi.vercel.app` still served the same DealDex build on
2026-08-20.  It is a stale alias, not a unique production host.  The
app's own hostname is `dealdex.online`.  `dealdex.vercel.app` is a
different Next.js product.  Docs only.  Do not invent a live URL.

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

Updated: 2026-08-20 (CURSOR — shipping docs + GitHub About)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (public).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat.  Prefix `grok-build/`.
- Website is optional.  Stack is React 19, TanStack Start, Tailwind v4,
  Better Auth, Vite.  Not Next.js / Expo / React Native / Capacitor.
- Hosting (checked 2026-08-20, see CONTRIBUTING.md):
  GitHub Production deploys `main` on Vercel team
  `jaywedgeworth22s-projects`.  `https://dealdex.online` and
  `https://dealdex-psi.vercel.app` both returned HTTP 200 DealDex with
  the same hashed JS as
  `https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app`.
  About should not keep `dealdex-psi` as the unique homepage.
  `https://dealdex.vercel.app` is a different product.  Coolify is not
  wired.  Do not invent a URL.
- Native Android debug APK builds with the Gradle 8.7 wrapper.  Package
  remains `me.grok.dealdex`.  Launcher is the official DD.
- iOS XcodeGen spec (`native/ios/project.yml`) uses
  `PRODUCT_BUNDLE_IDENTIFIER=online.dealdex` and
  `DEVELOPMENT_TEAM=CC8UTF7ATG`.  Apple App ID `online.dealdex` is
  registered (resource `R2FAW69NPD`, IAP on).  AppIcon catalog is wired;
  `CFBundleIconName` is `AppIcon`.
- In-app / web title mark is the official DealDex wordmark (PR #86).
  Home-screen AppIcon / Android launcher / PWA 180 are the overlapping
  red + blue DD (PR #87).

## Blockers

- App Store Connect **app record** for `online.dealdex` (bundle ID is
  registered; App Manager API cannot CREATE apps).  Account Holder must
  add DealDex once (SKU `dealdex`).  Do not upload to TestFlight until
  that record exists.
- Google Play Console credentials are not in `~/.secrets/`.
- Confirm long-term Vercel project ownership of `dealdex.online`.
  GitHub Production currently reports `jaywedgeworth22s-projects`.
- Infisical project (prod env), `SENTRY_FLEET_DSN`, and
  `FLEET_GITHUB_TOKEN` still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.
- `xcodebuild` on the Mac can hang at Xcode 26's `clang -v` probe.
  Fallback: `swiftc` + `simctl` (see `native/ios/CLAUDE.md`).  This
  Linux preview cannot run Xcode 26.

## Next

- After this docs PR: set GitHub About homepage to `https://dealdex.online`
  (verified live DealDex) or clear it.  Do not keep `dealdex-psi` as the
  unique production URL.  Do not use `dealdex.vercel.app`.
- Remaining seats start from `main` in their own worktrees.
