# 2026-08-13 — Marketplace logos and ship path

Seat: GROK-BUILD

## What shipped

- eBay four-color mark and Mercari character replace the word labels on
  source toggles, filter tabs, listing badges, alerts, the Apps phone
  mockup, and native Scan screens.
- `CONTRIBUTING.md` + README point every agent at GitHub `main`. Live
  site is a one-time Vercel or Coolify import of this repo.

## Verify

- Preview: logos on `/` scan controls and each listing row.
- `npx tsc --noEmit` clean.
- Mobile 390px: no horizontal overflow.

## Follow-up

Owner imports `jaywedgeworth22/DealDex` on Vercel/Coolify so merged PRs
go live. Other seats keep using the fleet PR loop in AGENTS.md.
