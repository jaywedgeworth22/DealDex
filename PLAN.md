# DealDex plan

Product direction lives in `README.md` and `native/README.md`. This file tracks
fleet / delivery posture, not card-desk features.

## Now

- Fleet membership: effort board, agent lanes, CI, Slack/digest/calendar
  registries.  See `docs/rollouts/2026-08-13-fleet-onboard.md`.
- GROK-BUILD standing seat: Mac lane + `fleet-apps.json`.  See
  `docs/rollouts/2026-08-14-grok-build-seat.md`.

## Next (product, not this PR)

- Runtime secrets in Infisical (prod env).  Owner creates the project — do
  not invent one.
- Custom domain on the Vercel **dealdex** project (GitHub `main` already
  linked; first deploy comes from this PR).
- iOS TestFlight via `/Users/jay/apps/ios-fleet` once an ASC app record exists
  for `me.grok.dealdex`.
- Android Play / sideload pipeline as the owner directs.

## Out of scope until asked

- Preview hostnames, per-agent `next dev` / Vite preview tunnels.
- Mixing DealDex keys into another app's Infisical project.
