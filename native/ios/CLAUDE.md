# DealDex iOS

**Bundle ID:** `online.dealdex`
**Apple bundle resource ID:** `R2FAW69NPD` — this is the Developer portal App ID resource, **not** a team ID.  Never put it in `DEVELOPMENT_TEAM`, `DevelopmentTeam`, or any team field.
**Team / DEVELOPMENT_TEAM:** `CC8UTF7ATG`
**Project:** `native/ios/DealDex.xcodeproj`
**Scheme:** `DealDex`
**ASC:** Apple bundle `online.dealdex` is registered (IAP capability on).  Jay has not created the App Store Connect app DealDex (SKU `dealdex`) yet.  Do not upload to TestFlight / ASC until that record exists.
**TestFlight ship:** `.github/workflows/ios-ship.yml` on `[self-hosted, macOS, ARM64, xcode26]`.  Wrapper `scripts/ios-ship-testflight.sh` (fleet key `dealdex`).  Cron is gated by `scripts/ios-scheduled-ship-gate.sh` so web-only commits do not ship.  Secrets stay in `~/.secrets/appstore-connect.env` on the Mac.
**XcodeGen:** `native/ios/project.yml` — add new `.swift` files under `DealDex/`, then run `xcodegen generate` from `native/ios`.  Do not hand-edit `project.pbxproj`.  `xcodegen-post.py` sets objectVersion 100 / LastUpgradeCheck 2630 so the File Inspector shows **Xcode 26.3**.  Deployment target is **iOS 18.0**.  Display name **DealDex**.
**AppIcon:** `DealDex/Assets.xcassets/AppIcon.appiconset` — Jay's rendered 3D interlocking DD, resized from `native/brand/dealdex-dd-icon-1024.png`.  Do not composite a fake tiled field.  `CFBundleIconName` is `AppIcon`.  Tab favicon is the isolated transparent DD, not the launcher.
**Title wordmark:** `Assets.xcassets/DealDexWordmark.imageset` — glossy 3D DealDex PNG used by `DealDexTitle` on Scan.  Isolated DD is `DealDexMark.imageset` (not the live launcher).
**Keys:** stay on device. Do not invent a cloud key store.

Binding fleet rule: `/Users/jay/apps/AGENT-SYNC.md` § iOS agent build loop. `xcodebuild` / `xcrun simctl` via bash are pre-approved. Do not ask. Do not stand up or narrate Xcode MCP.

## Build

```bash
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```

If `xcodebuild` hangs at `ExecuteExternalTool … clang -v -E -dM` (Xcode 26 Swift Build can stall on a full pipe on this Mac), compile with `swiftc` against the iPhoneSimulator SDK and `xcrun simctl install booted`.

Discover simulators with `xcrun simctl list devices available`. After a user-visible change:

```bash
xcrun simctl io booted screenshot /tmp/dd-ios-verify.png
```

`BUILD SUCCEEDED` is not visual QA.

## File structure

```
native/ios/
├── project.yml                         # XcodeGen spec (iOS 18 / Xcode 26.3)
├── xcodegen-post.py                    # objectVersion 100 + LastUpgradeCheck 2630
├── DealDex.xcodeproj/                  # generated; do not hand-edit
└── DealDex/
    ├── Assets.xcassets/AppIcon.appiconset   # DD on ST tiled field
    ├── Assets.xcassets/DealDexWordmark.imageset  # in-app title
    ├── DealDexBrand.swift              # DealDexTitle / DealDexMark
    ├── MarketplaceMarks.swift          # official eBay + Mercari paths
    ├── DealDexApp.swift                # App entry
    ├── NativeAuth.swift                # Sign in with Google (ASWebAuthenticationSession)
    ├── DeskStore.swift                 # desk / session store (origin defaults to dealdex.online)
    ├── DeskModel.swift                 # Desk types
    ├── Models.swift                    # Shared models
    ├── Market.swift                    # Market / comps
    ├── Appraise.swift                  # Appraisal flow
    ├── AccountApi.swift                # Account HTTP
    ├── ScanView.swift                  # Live scan (root)
    ├── AlertsView.swift                # Alerts
    ├── AccountView.swift               # Account
    ├── SettingsView.swift              # Settings / keys (on-device)
    └── PaidDesks.swift                 # Paid desk gate
```

## Rules

- `@Observable` + `@MainActor` on stores. Never `ObservableObject`.
- `NavigationStack` + value-based `NavigationLink`. Never `NavigationView`.
- Light is the product default. Do not ship dark-first chrome.
- Two spaces between sentences in user-visible copy.
- Brand is **DealDex**. Do not reintroduce old product names in user-facing copy.
- Never hand-edit `.pbxproj`, `.entitlements`, `.xib`, `.storyboard`.
- Secrets stay in `~/.secrets/` / Infisical / on-device keychain. Never print them.
