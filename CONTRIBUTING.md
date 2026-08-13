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

Wire hosting to this repo **once**. After that, merged PRs ship without anyone
redeploying by hand.

- **Vercel (fits this stack):** import
  [jaywedgeworth22/DealDex](https://vercel.com/new/import?s=https://github.com/jaywedgeworth22/DealDex)
  with production branch `main`. Build command is `npm run build`.
- **Coolify / other:** point the app at the same GitHub repo and `main`.

Do not create a second project for the same repo.

## Grok Build

Grok Build is the in-chat App Builder seat. Lane is this preview (`/workspace`).
Branch prefix `grok-build/`. GitHub is source of truth: rebase first, land a PR
when the change is real. If this checkout drifted, GitHub wins.

## Local

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run lint && npm run typecheck && npm test && npm run build
```
