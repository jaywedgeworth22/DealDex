# DealDex plan

Product direction lives in `README.md` and `native/README.md`.  This file tracks
fleet / delivery posture, not card-desk features.

## Now

- Fleet membership: effort board, agent lanes, CI, Slack/digest/calendar
  registries.  See `docs/rollouts/2026-08-13-fleet-onboard.md`.
- GROK-BUILD standing seat: Mac lane + `fleet-apps.json`.  See
  `docs/rollouts/2026-08-14-grok-build-seat.md`.
- Web identity: public host **https://dealdex.net** on **Vercel**.
  Vercel is current.  GitHub About homepage is that URL, not
  `dealdex-psi.vercel.app`.  Do not migrate copy to Coolify.  Do not
  point people at `dealdex.vercel.app` (different Next.js product).
- Native identity: Android `me.grok.dealdex`.  iOS `online.dealdex`, team
  `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is not a team id.

## Next (product, not this PR)

- Runtime secrets in Infisical (prod env).  Owner creates the project.  Do
  not invent one.
- Keep `dealdex.net` on Vercel.  Do not invent a replacement hostname
  and do not move the site to Coolify.
- iOS TestFlight via `.github/workflows/ios-ship.yml` (Mac runner
  `[self-hosted, macOS, ARM64, xcode26]`, app key `dealdex`, path
  `native/ios/`) once an ASC app record exists for `online.dealdex` (SKU
  `dealdex`).  Do not upload until Jay creates that app.  Team stays
  `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is not a team id.
  Fleet wrapper remains `/Users/jay/apps/ios-fleet`.
- Android Play / sideload pipeline as the owner directs.

## Out of scope until asked

- Preview hostnames, per-agent `next dev` / Vite preview tunnels.
- Mixing DealDex keys into another app's Infisical project.
