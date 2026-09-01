# 2026-09-01 — iOS Native Sentry Cocoa Telemetry & Crash Reporting (Antigravity, `ag/ios-sentry-cocoa-expansion`)

## Context & Objective
Integrates native Sentry Cocoa SDK into DealDex iOS to capture uncaught native crashes, out-of-memory events, and UI hangs (>2.0s), closing the mobile crash observability gap.

## Changes Made
- **Sentry Cocoa SPM Dependency**: Added `https://github.com/getsentry/sentry-cocoa.git` (`8.44.0+`) to `native/ios/project.yml` and linked `Sentry` product to target `DealDex`.
- **SentryTelemetry Manager**: Implemented `SentryTelemetry.swift` for crash reporting, 2.0s app-hang detection, HTTP 5xx error capture, and 0.2 distributed tracing.
- **Privacy Protections**: Disabled screenshot capture (`attachScreenshot = false`) and view hierarchy capture (`attachViewHierarchy = false`).
- **App Startup Wiring**: Initialized `SentryTelemetry.start()` in `DealDexApp.init()`.

### Touched Files
- `native/ios/project.yml`
- `native/ios/DealDex.xcodeproj/project.pbxproj`
- `native/ios/DealDex/DealDexApp.swift`
- `native/ios/DealDex/SentryTelemetry.swift`
- `docs/rollouts/2026-09-01-ios-sentry-cocoa-expansion.md`

## Decisions & Trade-offs
- **Privacy Gating**: Disabled screenshots and view hierarchy inspection to maintain user privacy.

## Verification State
- `xcodegen generate` — passed.
- `xcodebuild -project DealDex.xcodeproj -scheme DealDex -showdestinations` — resolved Sentry Cocoa SPM package cleanly.
- `npm run typecheck` — passed with 0 errors.
- `npm test` — 197/197 tests passed.

## Next Steps & Blockers
- None.
