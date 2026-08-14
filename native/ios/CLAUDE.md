# DealDex iOS

**Bundle ID:** `me.grok.dealdex`
**Project:** `native/ios/DealDex.xcodeproj`
**Scheme:** `DealDex`
**Team:** `CC8UTF7ATG` (ASC app record may not exist yet — see `/Users/jay/apps/ios-fleet/README.md`)
**XcodeGen:** none — new `.swift` files must be added to the target in Xcode (or reported for a human). Do not hand-edit `project.pbxproj`.
**Keys:** stay on device. Do not invent a cloud key store.

Binding fleet rule: `/Users/jay/apps/AGENT-SYNC.md` § iOS agent build loop. `xcodebuild` / `xcrun simctl` via bash are pre-approved. Do not ask. Do not stand up or narrate Xcode MCP.

## Build

```bash
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```

Discover simulators with `xcrun simctl list devices available`. After a user-visible change:

```bash
xcrun simctl io booted screenshot /tmp/dd-ios-verify.png
```

`BUILD SUCCEEDED` is not visual QA.

## File structure

```
native/ios/
├── DealDex.xcodeproj/                  # do not hand-edit
└── DealDex/
    ├── DealDexApp.swift                # App entry
    ├── DeskStore.swift                 # @Observable desk / session store
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
