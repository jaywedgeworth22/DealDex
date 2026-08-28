# 2026-08-28 — ANTIGRAVITY — DealDex Auth Fix, Fixed Origin & Polished Buttons

Branch `ag/auth-buttons-and-fixed-url` (PR #211, issue #210).

## 1. Summary of Changes

### A. Root Cause Resolution for Datadog 503 Fail-Closed Error
- Production Vercel environment was missing `DD_API_KEY`, Better Auth secret keys, and OAuth provider credentials, which caused the Datadog middleware (`server/middleware/datadog.ts`) to return 503 fail-closed responses.
- Injected required production and preview secrets directly into Vercel (`DD_API_KEY`, `DD_SITE`, `DD_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DEALDEX_WEB_GOOGLE_ID`, `DEALDEX_WEB_GOOGLE_SECRET`, `DEALDEX_X_CLIENT_ID`, `DEALDEX_X_CLIENT_SECRET`).
- Created `scripts/copy-pglite.mjs` and updated build command to copy `pglite.data`, `pglite.wasm`, and `initdb.wasm` into the serverless function `_libs/` directory, resolving the `ENOENT` filesystem lookup error.
- Verified on production `https://dealdex.net`: `curl -i "https://dealdex.net/api/native/oauth?provider=google&challenge=..."` successfully returns HTTP 302 redirect to Google Accounts.

### B. iOS Fixed Origin (Unmodifiable `https://dealdex.net`)
- Removed editable website origin `TextField` from `SettingsView.swift` and `AccountView.swift`.
- Updated `DeskStore.swift` and `DeskModel.swift` to use immutable `DeskStore.defaultOrigin = "https://dealdex.net"`.
- Added migration in `DeskStore.migrateLegacyDefaults()` to invalidate stale session tokens from previous custom preview hosts and clean up legacy `dealdex.origin` defaults.

### C. Polished Custom Sign-In Buttons (CT / ST Aesthetic Standard)
- Implemented `GoogleMark` (multicolor 4-color Canvas "G" ring matching Google vector specs), `AppleMark` (system Apple glyph), and `XMark` (vector X mark).
- Implemented `SocialSignInButton` with HIG height (48pt), continuous rounded border (10pt radius), light/dark theme adaptive background and stroke, and loading spinner state (`ProgressView`) while authentication is in flight.
- Updated `SettingsView.swift` and `AccountView.swift` with consistent section footers following two-space sentence gap rules.

## 2. Verification

- **Automated Tests**: `npm test` ran clean (196/196 tests passed).
- **TypeScript**: `npm run typecheck` clean (0 errors).
- **Web Build**: `npm run build` compiled clean with PGlite WASM assets bundled.
- **iOS Simulator Build**: `xcodebuild` completed clean (**BUILD SUCCEEDED**).
- **iOS Runtime & Visual Inspection**: Booted iOS Simulator (`iPhone 17 Pro`), installed `DealDex.app`, launched into Settings screen, and verified screenshot capture at `/tmp/settings_screen_fresh.png` and brain artifacts directory.
- **Production Deployment**: Vercel production deployment verified live on `https://dealdex.net`.
