# DealDex Hosting

Mutable hosting detail lives here, not in `AGENTS.md`.  `AGENTS.md` is for durable repo rules only, and where the site is served from can change.  If the host, domain, or deploy behavior changes, update this file.

## Public Host

- **https://dealdex.net** on **Vercel**.  Vercel is current, not a leftover.
- The GitHub About homepage is that URL.
- Do not use `dealdex-psi.vercel.app` as the homepage.
- `https://dealdex.vercel.app` is a different Next.js site and is not this repo.
- Do not invent another live URL.

## How Code Reaches Production

- GitHub `main` is the code.  Vercel builds Production from `main` on merge.
- `vercel.json` sets `ignoreCommand` to `bash vercel-ignore-hourly.sh` (the Ignored Build Step).  That script skips every preview, skips a production build when the commit changed no site files (docs, `native/`, `.github/`, `STATUS.md`, `PLAN.md`, and the effort log are excluded), and, when `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are available to the build, allows at most one production build per hour.  The script is the source of truth for the current rule.
- Manual override: set `VERCEL_FORCE_DEPLOY=1`, or use Dashboard Redeploy with Ignore Build Step unchecked.
- After a green merge, other agents pull `main`.
- Sentry production deploy markers are recorded by a separate workflow, see `docs/sentry-deploy-vercel.md`.

## Rules

- Do not migrate the site to Coolify.
- The Grok Build App Builder preview (`/workspace`) is not live hosting.  See the Grok Build section of `AGENTS.md` for that seat's workflow.
