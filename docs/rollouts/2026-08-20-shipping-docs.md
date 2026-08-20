# 2026-08-20 — Shipping docs and GitHub About

Updated: Thu, Aug 20, 2026 (CURSOR)

## Asked

Update DealDex GitHub About, README, and docs so they match how the app
ships now.  About homepage was `https://dealdex-psi.vercel.app`.  Bundle
is `online.dealdex`, Apple team `CC8UTF7ATG`.  Docs/metadata only.  Do
not invent a live URL.  Open a PR with what changed and the evidence.

## Evidence (2026-08-20)

Repo + native (this checkout, `main` at `9b3c1d3`):

- `native/android/app/build.gradle.kts`: `applicationId` / namespace
  `me.grok.dealdex`.  Compose + Kotlin.  Launcher string `DealDex`.
- `native/ios/project.yml` + `DealDex/Info.plist`:
  `PRODUCT_BUNDLE_IDENTIFIER` / `CFBundleIdentifier` `online.dealdex`.
  `DEVELOPMENT_TEAM` `CC8UTF7ATG`.  Display name DealDex.
- `package.json`: React 19, TanStack Start, Tailwind v4, Better Auth,
  Vite.  Not Next.js.
- `gh repo view`: visibility `PUBLIC`, About homepage
  `https://dealdex-psi.vercel.app`.

HTTP GET (curl `--compressed`, no new hostnames invented):

| URL | Result |
| --- | --- |
| `https://dealdex-psi.vercel.app/` | HTTP 200, title DealDex, Vite `/assets/index-BV1SWqsO.js` |
| `https://dealdex.online/` | HTTP 200, same title, same JS hash / etag `f92f6473…` |
| `https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app/` | HTTP 200, same JS, `x-robots-tag: noindex` |
| GitHub Production latest | sha `9b3c1d3`, state success, environment URL on team `jaywedgeworth22s-projects` |
| `https://dealdex.vercel.app/` | HTTP 200, Next.js, title "DealDeX - Revolutionizing E-commerce" (not this repo) |
| `https://dealdex.com/` | 114-byte lander redirect, not this app |
| `https://www.dealdex.online/` | TLS name mismatch |

OG tags on the three DealDex hosts all said `https://dealdex.online/`,
which matches `VITE_PUBLIC_HOSTNAME` in `src/routes/__root.tsx`.

Conclusion: `dealdex-psi.vercel.app` still serves this app.  It is not
the unique production identity.  About should use `https://dealdex.online`
or be cleared.  Do not set About to `dealdex.vercel.app`.

## What changed

- `README.md` — PR loop (not push to `main`).  Verified hosts.  Native
  IDs.  Stack.  Apache 2.0 pointer.
- `CONTRIBUTING.md` — live-site section rewritten from the GET evidence.
  Dropped the claim that `jaywedgeworth22s-projects` is unused.
- `PLAN.md`, `STATUS.md`, `AGENTS.md` (public + no Coolify), 
  `.github/copilot-instructions.md`, `native/README.md`,
  `docs/store-listing.md`, `docs/EFFORT-LOG.md`, this note.

## Left alone

- App / native source (in-app "DealDex.com" strings still exist in
  Android Kotlin; out of scope).
- Dated rollout notes from earlier days.
- Coolify or Vercel project settings (no dashboard write from here).

## Verify

```bash
gh repo view jaywedgeworth22/DealDex --json visibility,homepageUrl,description
curl -sSI https://dealdex-psi.vercel.app/ | head
curl -sSI https://dealdex.online/ | head
rg -n 'online.dealdex|CC8UTF7ATG|me.grok.dealdex' README.md native/README.md
```
