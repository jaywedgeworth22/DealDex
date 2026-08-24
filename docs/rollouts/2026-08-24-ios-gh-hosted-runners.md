# 2026-08-24 — GitHub-hosted macos-latest for DealDex iOS ship

## Correction

#170 restored `[self-hosted, macOS, ARM64, xcode26]`.  That violates the
updated fleet protocol: **GitHub-hosted runners for iOS builds and everything
else**.  Local Mac self-hosted runners are banned.

#167 was the right runner (`macos-latest`).  It failed because the wrapper
still exec'd `/Users/jay/apps/ios-fleet/ship-testflight.sh`, which does not
exist on a hosted runner.  #170's vendored `scripts/ios-fleet` stays.

## Changes

- `.github/workflows/ios-ship.yml` — `runs-on: macos-latest` again.
- `scripts/ios-appstore-gm-prepare.sh` — same as Congress.Trade: write
  `~/.secrets/appstore-connect.env` from repo secrets and import the
  Distribution p12.  Never print values.
- Import step uses `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`,
  `IOS_DIST_P12_BASE64`, `IOS_DIST_P12_PASSWORD`.
- Docs / tests no longer require a local Mac runner.

## Secrets

If those five repo secrets are empty, the import step is skipped and the
hosted ship cannot upload.  Copy the same secret names already used on
Congress.Trade.  Do not paste values into chat.
