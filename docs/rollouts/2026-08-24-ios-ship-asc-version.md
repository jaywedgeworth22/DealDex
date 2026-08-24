# 2026-08-24 — Finish ASC 1.0.N (vendor fleet + Mac runner)

## What was still open

#165 synced Xcode to the fleet regimen (`1.0.2` / `202608230250`).  App Store
Connect still showed **`1.0 (1)`** because no new IPA reached ASC.

#167 then switched `.github/workflows/ios-ship.yml` to `macos-latest`.  That
runner has no `/Users/jay/apps/ios-fleet` and no `~/.secrets/appstore-connect.env`.
Scheduled ships after the switch failed in ~14s:

```
bash: /Users/jay/apps/ios-fleet/ship-testflight.sh: No such file or directory
```

The public iTunes lookup for `net.dealdex` / id `6802474288` is still empty
(TestFlight only).  The fleet manifest still lists `net.dealdex` as `1.0.2`
(`202608230250`).

## Changes

- Vendor DealDex-local `scripts/ios-fleet/` from Congress.Trade (ship script,
  ASC client, ExportOptions, publish-ios-versions).
- `apps.json` is DealDex-only: bundle `net.dealdex`, marketing default `1.0.2`.
- Wrapper prefers the in-repo copy, then `/Users/jay/apps/ios-fleet`.
- Restore runner `[self-hosted, macOS, ARM64, xcode26]` (the only host with
  signing identities and ASC secrets).
- Fix leftover conflict markers in `docs/EFFORT-LOG.md`.

## After merge

Dispatch or wait for the Mac `ios-ship` cron.  The fleet script resolves the
next `1.0.N` + UTC build.  ASC Latest should then read like
`1.0.3 (202608242338)` instead of `1.0 (1)`.
