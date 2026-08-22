# 2026-08-22 — Vercel Web Analytics on DealDex

## Why

Owner asked to follow Vercel's Get Started for Web Analytics on DealDex.  The dashboard snippet uses `@vercel/analytics/next`.  DealDex is TanStack Start + Vite on Vercel, so the correct import is `@vercel/analytics/react`.

## What

- Installed `@vercel/analytics`.
- Mounted `<Analytics />` in `src/routes/__root.tsx` (document body).
- Service worker no longer intercepts `/_vercel/` so insight script + beacons skip the cache path.
- Privacy page: website uses Vercel Web Analytics; no cookies; native apps do not send those events.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After merge to `main`, visit https://dealdex.online and navigate between `/`, `/privacy`, `/saved`.  Vercel dashboard Analytics should show page views within about 30 seconds if content blockers are off.

## Follow-ups

- Confirm Web Analytics is toggled on for Vercel project `dealdex` (`prj_xcIQb423JxSHHMY0lHmDqvSh95QF`, team Jay's Services).  The Get Started page already listed the package steps, so the product is selected.
- Do not add `@vercel/analytics/next` — that import is for Next.js only.
