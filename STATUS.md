# Status

Updated: 2026-08-13 (GROK — marketplace logos)

## Current state

- GitHub: `jaywedgeworth22/DealDex` (private). Integration tree:
  `/Users/jay/Code/DealDex` tracks `origin/main`.
- Fleet member: acronym **DD**, Slack `repo: DealDex`, live board
  `~/apps/DEALDEX-EFFORT-LOG.md`.
- Scan, alerts, listing badges, evaluator, Apps mockup, and native Scan
  screens show the eBay and Mercari marks instead of the words.
- CI on `main` is green after PR #3 (`npm install` on Node 22).

## Blockers

- Live hosting is not wired yet. Import this repo on Vercel (or Coolify)
  against `main` so merged PRs ship. See CONTRIBUTING.md.
- Owner later: Infisical, App Store Connect for `me.grok.dealdex`.
- Digest/calendar will not see this private repo until Actions secret
  `FLEET_GITHUB_TOKEN` on ai-fleet-coordinator includes it.

## Next

- Owner: one-time Vercel/Coolify import so `main` is the live site.
- Remaining seats start from `main` in their own worktrees.
