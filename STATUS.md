# Status

Updated: Fri, Aug 14, 2026 at 3:50 PM CT (GROK — native iOS + Android builds)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat.  Prefix `grok-build/`.
- Vercel project **dealdex** is linked to GitHub `main`.
- Native Android debug APK builds with the new Gradle 8.7 wrapper.
  iOS has an XcodeGen spec (`native/ios/project.yml`).  Simulator
  install verified this turn.

## Blockers

- Custom domain, Infisical project (prod env), App Store Connect for
  `me.grok.dealdex`, `SENTRY_FLEET_DSN`, and `FLEET_GITHUB_TOKEN` (so the
  digest can see this private repo) still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.
- `xcodebuild` on this Mac can hang at Xcode 26's `clang -v` probe.
  Fallback: `swiftc` + `simctl` (see `native/ios/CLAUDE.md`).

## Next

- TestFlight / ASC app record when the owner is ready.
- Remaining seats start from `main` in their own worktrees.
