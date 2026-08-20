# DealDex — how work ships

**GitHub `main` is the product.**  Repo: https://github.com/jaywedgeworth22/DealDex (public).

Every agent (Grok, Grok Build, Claude, Codex, Cursor, Antigravity, Monet) and
every human uses the same loop.  Durable rules live in [`AGENTS.md`](AGENTS.md).
This file is the short version.

## Loop

1. Work in your seat's lane / branch prefix (`grok-build/`, `grok/`, `claude/`,
   `cursor/`, …).  Do not edit `/Users/jay/Code/DealDex` and do not push
   straight to `main`.
2. `git fetch origin && git rebase origin/main` before you start.
3. Finish one coherent unit.  Update `STATUS.md`, `docs/EFFORT-LOG.md`, and a
   `docs/rollouts/` note.
4. Commit, push the branch, open a PR, merge when CI is green.

That merge is what other agents pull.  It is also what Vercel Production
builds from.

## Live site

GitHub `main` is the code.  This preview (`/workspace`) is a workbench, not
production.

Checked 2026-08-20 (HTTP GET, no invented hostnames):

- GitHub Production deployments for this repo succeed on Vercel team
  `jaywedgeworth22s-projects` when `main` moves.  Latest checked:
  sha `9b3c1d3`, environment URL
  `https://dealdex-ikpfyvfec-jaywedgeworth22s-projects.vercel.app`
  (success).  The stable git alias
  `https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app` returned
  HTTP 200 DealDex (Vite assets, `x-robots-tag: noindex`).
- `https://dealdex.online` returned HTTP 200, title DealDex, same hashed
  JS (`/assets/index-BV1SWqsO.js`, etag `f92f6473…`) as that git alias.
  The web app's default `VITE_PUBLIC_HOSTNAME` and OG tags use this host.
- `https://dealdex-psi.vercel.app` (the GitHub About homepage as of
  2026-08-20) returned the same DealDex build.  It is a stale project
  alias, not a distinct production.
- `https://dealdex.vercel.app` is a different Next.js site
  ("DealDeX - Revolutionizing E-commerce").  Do not point About or docs
  at it.
- Coolify is not a current host.

Do not invent a second live URL.  If `dealdex.online` is behind `main`,
re-check the Vercel project linked to `jaywedgeworth22/DealDex`
(production branch `main`) and whether that project still owns the
custom domain.

Native shipping is separate: Android package `me.grok.dealdex` (sideload
debug APK), iOS bundle `online.dealdex`, team `CC8UTF7ATG`.  TestFlight
and Play stay blocked on owner records.  See `README.md` and
`docs/store-listing.md`.

## Grok Build

Grok Build (`GROK-BUILD`) is a standing seat, distinct from Mac Grok (`GROK`).
Branch prefix `grok-build/`.  Cloud App Builder preview lane is `/workspace`.
Mac Grok Build TUI lane is `~/apps/dealdex-grok-build`.  Never edit
`/Users/jay/Code/DealDex`.  GitHub is source of truth: rebase first, land a PR
when the change is real.  If this checkout drifted, GitHub wins.

## Local

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run lint && npm run typecheck && npm test && npm run build
```
