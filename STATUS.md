# Status

Updated: 2026-08-15 (GROK-BUILD — live host is Grok Vercel + GitHub + dealdex.online)

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
- Native Android debug APK builds with the new Gradle 8.7 wrapper.
  iOS has an XcodeGen spec (`native/ios/project.yml`).  Simulator
  install verified this turn.

## Blockers

- App Store Connect **app record** for `me.grok.dealdex` (bundle ID is
  registered; App Manager API cannot CREATE apps).  Account Holder must
  add DealDex once (SKU `dealdex`).
- Google Play Console credentials are not in `~/.secrets/`.
- Custom domain **dealdex.online** is on Grok's Vercel but not tracking
  GitHub `main`.  Re-link the repo on that Grok project.
- Infisical project (prod env), `SENTRY_FLEET_DSN`, and
  `FLEET_GITHUB_TOKEN` still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.
- `xcodebuild` on this Mac can hang at Xcode 26's `clang -v` probe.
  Fallback: `swiftc` + `simctl` (see `native/ios/CLAUDE.md`).

## Next

- TestFlight / ASC app record when the owner is ready.
- Remaining seats start from `main` in their own worktrees.
