# 2026-08-14 — TestFlight / App Store / Play submit

Updated: Fri, Aug 14, 2026 at 4:25 PM CT (GROK)

## Asked

Submit the iOS app to TestFlight then the App Store, and do the same for
Android on Play.

## What ran

- Registered Apple bundle ID `me.grok.dealdex` (`KJX389KP5M`, team
  `CC8UTF7ATG`).
- `POST /v1/apps` returned 403: the App Manager ASC key cannot CREATE
  apps.  Chrome is not signed into App Store Connect (`authResult=FAILED`).
- Added `/privacy`, export-compliance plist key, XcodeGen `1.0.1`,
  `scripts/ios-ship-testflight.sh`, and listing copy in
  `docs/store-listing.md`.
- Fleet script now accepts `dealdex`.  `apps.json` points at
  `native/ios` for XcodeGen.

## Blockers (need the owner)

1. **App Store Connect app record.**  Account Holder / Admin: New App →
   iOS → DealDex → bundle `me.grok.dealdex` → SKU `dealdex` → English
   (U.S.).  After that, `bash scripts/ios-ship-testflight.sh --force-ship`
   from `~/apps/dealdex-grok` can upload.
2. **This Mac has no Apple Distribution identity** in the login keychain
   (only Developer ID Application/Installer).  Archive may still work via
   `-allowProvisioningUpdates` + the ASC API key; if it does not, ship
   from a `mac-xcode26-*` runner that already ships ST/CT/UM.
3. **Google Play.**  No Play Console token or service-account JSON in
   `~/.secrets/`.  Listing copy is ready; upload cannot start until that
   exists.

## Next

Owner creates the ASC app (one click).  Then this seat re-runs the ship
script and fills screenshots + review from `docs/store-listing.md`.
