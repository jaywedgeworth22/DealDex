# Status

Updated: 2026-08-14 (GROK-BUILD — Vercel project linked)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private).  Integration tree:
  `/Users/jay/Code/DealDex` stays on `origin/main` (do not edit there).
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** (`GROK-BUILD`) is a standing seat.  Prefix `grok-build/`.
  Mac TUI lane: `~/apps/dealdex-grok-build`.  Cloud preview: `/workspace`.
  Inventory: fleet #26 (`fleet-apps.json`) + #27 (AGENT-SYNC seat table).
- Vercel project **dealdex** is linked to this GitHub repo, production
  branch `main`.  Team `jaywedgeworth22s-projects`.  First production
  deploy fires when this commit lands on `main`.
- Marketplace logos: official eBay four-color wordmark + official Mercari
  blue wordmark.  Scan/alert chips use solid white letters (PR #37).
- CI on `main` is green after PR #3 (`npm install` on Node 22).

## Blockers

- Custom domain, Infisical project (prod env), App Store Connect for
  `me.grok.dealdex`, `SENTRY_FLEET_DSN`, and `FLEET_GITHUB_TOKEN` (so the
  digest can see this private repo) still need the owner.
- Integration tree `~/Code/DealDex` is dirty (uncommitted
  `native/ios/DealDex.xcodeproj` bits) and behind `origin/main`.  Do not
  fast-forward it until those files are cleaned by a human or an iOS lane.

## Next

- Confirm the first Vercel production deploy after this PR merges.
- Remaining seats start from `main` in their own worktrees.
