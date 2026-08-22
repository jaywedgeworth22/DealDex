# 2026-08-22 — OG social card: logo only

Updated: Sat, Aug 22, 2026 (CURSOR)

## Asked

Remove all text from the social sharing image except the DealDex logo.  Center
the wordmark horizontally and vertically and let it fill most of the 1200×630
card.

## What changed

- `scripts/og-dealdex.html` — flex-centered layout; subtitle, footer, and
  border rule removed; wordmark at ~88% width / 78% max height.
- `public/og.jpg` — re-rendered via `node scripts/render-og.mjs`.
- `src/routes/__root.tsx` — cache-bust `og.jpg?v=logo-only-20260822`.

## Verify

```bash
node scripts/render-og.mjs
npm run lint
npm run typecheck
npm test
```
