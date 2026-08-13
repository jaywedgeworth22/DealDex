# 2026-08-13 — DealDex fleet onboard

## Context & Objective

`~/Code/DealDex` was an empty folder next to an already-existing private GitHub
repo `jaywedgeworth22/DealDex`. The owner asked to link the folder to that
repo and join DealDex to the fleet the same way ST / CT / UM work.

## Changes Made

- Cloned `https://github.com/jaywedgeworth22/DealDex.git` into
  `/Users/jay/Code/DealDex` (integration tree, stays on `main`).
- Agent lane: `~/apps/dealdex-grok` on `grok/fleet-onboard`.
- Stopped ignoring `AGENTS.md` (Grok template leftover) so the fleet pointer
  is tracked.
- Added `AGENTS.md`, `CLAUDE.md` (symlink), `STATUS.md`, `PLAN.md`,
  `docs/EFFORT-LOG.md`, this rollout note.
- Copied `scripts/sync-effort-issues.py` (verbatim) and
  `.github/workflows/effort-issues-sync.yml`.
- Added a first `CI` workflow (lint / typecheck / test / build on hosted
  Ubuntu) and `auto-update-prs.yml`.
- Copied `scripts/slack-sync.sh` so cloud sessions can post without MCP.
- Live board: `/Users/jay/apps/DEALDEX-EFFORT-LOG.md`.

## Decisions & Trade-offs

- Acronym **DD**, Slack `repo: DealDex`, worktree prefix `dealdex-`.
- Hosted GitHub Actions for now (no DealDex Coolify runner yet). Other fleet
  apps prefer self-hosted runners; flip later with a repo variable when a
  runner exists.
- Did not create Infisical / Coolify / ASC records. Those need owner
  dashboard work. Listed in `PLAN.md`.
- Did not `npm install` every seat worktree. Create
  `dealdex-{claude,codex,antigravity,cursor,monet}` when those seats start.

## Verification State

- `git remote -v` → `origin` = `jaywedgeworth22/DealDex`.
- Integration tree on `main`; this branch only in the grok worktree.
- `npm run lint` (0 errors, 7 pre-existing warnings), `npm run typecheck`,
  `npm test` (41 pass). One lint error in `scripts/scan-qa.mjs` (`catch {}`)
  fixed so the new CI workflow can go green.

## Next Steps & Blockers

- Register DD in ai-fleet-coordinator digest/calendar/protocol (same session,
  `grok/dealdex-onboard`).
- Land this PR, then remaining seats can start from `main`.
