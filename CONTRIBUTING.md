# DealDex — how work ships

**GitHub `main` is the product.** Repo: https://github.com/jaywedgeworth22/DealDex

Every agent (Grok, Grok Build, Claude, Codex, Cursor, Antigravity, Monet) and
every human uses the same loop. Durable rules live in [`AGENTS.md`](AGENTS.md).
This file is the short version.

## Loop

1. Work in your seat's lane / branch prefix (`grok-build/`, `grok/`, `claude/`,
   …). Do not edit `/Users/jay/Code/DealDex` and do not push straight to `main`.
2. `git fetch origin && git rebase origin/main` before you start.
3. Finish one coherent unit. Update `STATUS.md`, `docs/EFFORT-LOG.md`, and a
   `docs/rollouts/` note.
4. Commit, push the branch, open a PR, merge when CI is green.

That merge is what other agents pull. It is also what the live site should
build from.

## Live site

**Grok's Vercel** serves **https://dealdex.online**.  **GitHub `main`** is the
source of truth.  Those two are supposed to be one loop:

1. Every agent (including Grok Build) lands a PR on `jaywedgeworth22/DealDex`.
2. Merge to `main`.
3. Grok's Vercel builds that commit and dealdex.online updates.

Do not put production on a personal `jaywedgeworth22s-projects` Vercel app.
That was a parallel project.  Leave it or delete it — it is not the live site.

Grok App Builder preview (`/workspace`) is a workbench, not production.  Ship
through GitHub so Claude / Codex / Cursor / Grok all hit the same tree.

If dealdex.online is behind `main`, Grok's Vercel project is not subscribed to
this repo.  Re-link `jaywedgeworth22/DealDex` (production branch `main`) on
**Grok's** Vercel, keep `dealdex.online` on that project, set
`VITE_PUBLIC_HOSTNAME=dealdex.online`.

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
