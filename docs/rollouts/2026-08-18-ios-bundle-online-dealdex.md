# 2026-08-18 — iOS bundle ID `online.dealdex`

Updated: Tue, Aug 18, 2026 (CURSOR)

## Asked

Switch the iOS bundle identifier from `me.grok.dealdex` to `online.dealdex`.
Keep team `CC8UTF7ATG`.  Do not treat Apple bundle resource id `R2FAW69NPD`
as a team id.  Do not upload to App Store Connect / TestFlight.

## IDs (do not mix)

| What | Value | Use |
|------|-------|-----|
| Bundle ID | `online.dealdex` | `PRODUCT_BUNDLE_IDENTIFIER`, `bundleId`, `CFBundleIdentifier` |
| Apple bundle resource ID | `R2FAW69NPD` | Developer portal App ID resource only.  **Not** a team id. |
| DEVELOPMENT_TEAM | `CC8UTF7ATG` | Xcode / XcodeGen team field.  Unchanged. |

Apple App ID `online.dealdex` is registered with IAP.  Jay has not created
the ASC app DealDex (SKU `dealdex`).

## What changed

- `native/ios/project.yml` — `bundleId` + `PRODUCT_BUNDLE_IDENTIFIER` now
  `online.dealdex`.  `DEVELOPMENT_TEAM` stays `CC8UTF7ATG`.
- `native/ios/DealDex/Info.plist` — `CFBundleIdentifier` is `online.dealdex`.
- Generated `DealDex.xcodeproj` with XcodeGen 2.44.1 (`xcodegen generate`
  from `native/ios`).  Debug + Release `PRODUCT_BUNDLE_IDENTIFIER` are
  `online.dealdex`.  `DEVELOPMENT_TEAM` / `DevelopmentTeam` stay
  `CC8UTF7ATG`.  `R2FAW69NPD` does not appear in the pbxproj.
- Current docs / registry: `native/ios/CLAUDE.md`, `native/README.md`,
  `AGENTS.md`, `STATUS.md`, `PLAN.md`, `docs/store-listing.md`,
  `docs/EFFORT-LOG.md`.
- Android package `me.grok.dealdex` is unchanged.

## Not done

- No Xcode 26 build on this Linux preview (`xcodebuild` is not installed).
  XcodeGen itself ran here and wrote the pbxproj.
- No TestFlight / ASC upload.
- Mac `~/apps/ios-fleet` `apps.json` (host-only) should list
  `online.dealdex` the next time a Mac seat ships.  Coordinator
  `fleet-apps.json` has no bundle-id field.

## Verify

```bash
# Spec + generated project
rg -n 'PRODUCT_BUNDLE_IDENTIFIER|bundleId|DEVELOPMENT_TEAM|DevelopmentTeam' \
  native/ios/project.yml native/ios/DealDex.xcodeproj/project.pbxproj
# Resource id must not appear as a team setting
rg -n 'R2FAW69NPD' native/ios || true
# Mac only
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```
