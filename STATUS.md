# Status

Updated: 2026-08-14 (GROK-BUILD — standing fleet seat + Mac lane)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat, distinct from Mac Grok
  (`GROK`).  Prefix `grok-build/`.  Mac TUI lane: `~/apps/dealdex-grok-build`.
  Cloud App Builder preview lane remains `/workspace`.
- `fleet-apps.json` now has the GROK-BUILD seat row.  AGENT-SYNC seat table
  is a GROK FLEET keepout this turn — Mac Grok will add the matching row.
- Marketplace logos: official eBay four-color wordmark + official Mercari
  blue wordmark.  Scan/alert chips use solid white letters (PR #37).
- CI on `main` is green after PR #3 (`npm install` on Node 22).

## Blockers

- Live hosting is not wired yet.  Import this repo on Vercel (or Coolify)
  against `main` so merged PRs ship.  See CONTRIBUTING.md.  Owner already
  invoked `/vercel /+` in this session — parked until this seat PR lands.
- Owner later: Infisical project (prod env), App Store Connect for
  `me.grok.dealdex`, `SENTRY_FLEET_DSN`, `FLEET_GITHUB_TOKEN` so digest can
  see this private repo.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.

## Next

- Land this GROK-BUILD seat registration.
- Resume Vercel import (`/vercel /+`) after merge.
- Remaining seats start from `main` in their own worktrees.
