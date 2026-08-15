# 2026-08-15 — Grok Vercel + GitHub + dealdex.online

Seat: GROK-BUILD

Owner wants production on **Grok's** Vercel, with GitHub as the other side.
Not `jaywedgeworth22s-projects` (PR #70 closed).

- Public host: https://dealdex.online
- Code: `jaywedgeworth22/DealDex` `main`
- This seat ships PRs to GitHub.  Other agents do the same.
- Gap: Grok's Vercel is serving an older publish and is not building `main`.
  Re-link that Grok project to this repo (production branch `main`), keep
  dealdex.online on it, set `VITE_PUBLIC_HOSTNAME=dealdex.online`.
