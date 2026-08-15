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

One Vercel project.  One GitHub repo.  One public host.

| Piece | Value |
| --- | --- |
| GitHub | `jaywedgeworth22/DealDex` · production branch `main` |
| Vercel | project **dealdex** on team `jaywedgeworth22s-projects` (`prj_xcIQb423JxSHHMY0lHmDqvSh95QF`) |
| Public host | **https://dealdex.online** |

Loop:

1. Agents land PRs on GitHub `main`.
2. Vercel builds that commit.
3. dealdex.online serves it.

Do **not** use Grok's Vercel as production.  That account is only the App
Builder preview.  dealdex.online drifted onto it and went stale.  Production
is **your** team `jaywedgeworth22s-projects`, project **dealdex**, fed by
this GitHub repo.  Do not create a second Coolify app.

### Attach the domain (you, once, on your Vercel)

1. Log into **your** Vercel (`jaywedgeworth22s-projects`), not Grok's.
2. Project **dealdex** → Settings → Domains → Add `dealdex.online` and `www.dealdex.online`.
3. If it says the domain is on another project, that is Grok's publish.  Remove it there (or ask Grok support to drop it) so it can live on yours.
4. Point DNS at what your Vercel prints (`cname.vercel-dns.com` or the A/AAAA they show).
5. Env on that project, Production: `VITE_PUBLIC_HOSTNAME=dealdex.online`, then Redeploy.

After that: GitHub `main` → your Vercel → dealdex.online.  Grok Build still ships through GitHub PRs.  Grok's site is only a preview.

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
