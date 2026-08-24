# DealDex-local iOS fleet ship copy

Vendored from Congress.Trade `scripts/ios-fleet` so this repo can ship
without `/Users/jay/apps/ios-fleet` on the runner.  `apps.json` here is
DealDex-only: bundle `net.dealdex`, marketing `1.0.N`, build UTC
`YYYYMMDDHHMM`.

`scripts/ios-ship-testflight.sh` prefers this directory, then falls back
to `/Users/jay/apps/ios-fleet` on Jay's Mac.

Secrets stay in `~/.secrets/appstore-connect.env` on the Mac runner.
Do not put ASC keys in GitHub secrets or this tree.

When fleet ship behavior changes, copy `ship-testflight.sh`, `asc-api.mjs`,
`publish-ios-versions.sh`, and the ExportOptions plists from Congress.Trade
and keep this `apps.json` DealDex-only.

`publish-ios-versions.sh` must seed from the live
`jaywedgeworth22/ios-app-versions` `versions.json` (or `--base-json`).
This directory does not carry a full local snapshot.  Publishing
`{apps:{net.dealdex}}` would wipe sibling fleet apps from the shared
manifest the in-app update prompt reads.
