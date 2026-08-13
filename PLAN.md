# DealDex plan

Product direction lives in `README.md` and `native/README.md`. This file tracks
fleet / delivery posture, not card-desk features.

## Now

- Fleet membership: effort board, agent lanes, CI, Slack/digest/calendar
  registries. See `docs/rollouts/2026-08-13-fleet-onboard.md`.

## Next (product, not this PR)

- Runtime secrets in Infisical (prod env) when a host exists.
- Production host (Coolify or the chosen web target) with auto-deploy on `main`
  only after the owner picks it.
- iOS TestFlight via `/Users/jay/apps/ios-fleet` once an ASC app record exists
  for `me.grok.dealdex`.
- Android Play / sideload pipeline as the owner directs.

## Out of scope until asked

- Preview hostnames, per-agent `next dev` / Vite preview tunnels.
- Mixing DealDex keys into another app's Infisical project.
