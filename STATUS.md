# Status

Updated: 2026-08-13 (Grok Build — joined the fleet)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private). Integration tree:
  `/Users/jay/Code/DealDex` tracks `origin/main`.
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- **Grok Build** is the App Builder preview seat. Prefix `grok-build/`.
  Lane is this preview (`/workspace`), not Mac Grok's `~/apps/dealdex-grok`.
- Marketplace logos landed on `main` (PR #10). Scan, alerts, listing
  badges, evaluator, Apps mockup, and native Scan use the eBay and Mercari
  marks.
- CI on `main` is green after PR #3 (`npm install` on Node 22).

## Blockers

- Live hosting is not wired yet. Import this repo on Vercel (or Coolify)
  against `main` so merged PRs ship. See CONTRIBUTING.md.
- Owner later: Infisical, App Store Connect for `me.grok.dealdex`.
- Digest/calendar will not see this private repo until Actions secret
  `FLEET_GITHUB_TOKEN` on ai-fleet-coordinator includes it.
- Slack `#agent-sync` is a no-op from this preview (`SLACK_BOT_TOKEN` unset).
  Coordination here is GitHub PRs + the effort board.

## Next

- Owner: one-time Vercel/Coolify import so `main` is the live site.
- Remaining seats start from `main` in their own worktrees.
- Product work as the owner directs. Grok Build stays on the fleet loop.
