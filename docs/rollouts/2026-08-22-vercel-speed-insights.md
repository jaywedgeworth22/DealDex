# 2026-08-22 — Vercel Speed Insights on DealDex

## Why

Owner asked to follow Vercel's Get Started for Speed Insights on DealDex.  The
dashboard snippet uses `@vercel/speed-insights/next`.  DealDex is TanStack
Start + Vite on Vercel, so the correct import is `@vercel/speed-insights/react`.

## What

- Installed `@vercel/speed-insights`.
- Mounted `<SpeedInsights />` in `src/routes/__root.tsx` (document body).
- Pass the TanStack route template through `computeRoute` so `/card/$cardId`
  groups as one path instead of one row per card id.
- Service worker already skips `/_vercel/` (Web Analytics #128), so
  `/_vercel/speed-insights/script.js` and vitals beacons skip the cache path.
- Privacy page: website uses Vercel Speed Insights for Core Web Vitals; no
  cookies; native apps do not send those events.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After merge to `main`, visit https://dealdex.net and navigate between `/`,
`/privacy`, `/saved`.  Vercel dashboard Speed Insights should show the first
data points within about 30 seconds if content blockers are off.  RES needs
more samples than a single visit.

## Follow-ups

- Confirm Speed Insights is toggled on for Vercel project `dealdex` (team
  Jay's Services).  The Get Started page already listed the package steps, so
  the product is selected.
- Do not add `@vercel/speed-insights/next` — that import is for Next.js only.
