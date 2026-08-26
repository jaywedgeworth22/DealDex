# 2026-08-25 Configure Google/Apple/X OAuth & Polish Web Scan UI

## Scope & Objective
Configure Google, Apple (SIWA), and X (Twitter) OAuth 2.0 authentication integration across DealDex, wire environment variable alias mapping, place Google client configuration files in native iOS and Android projects, and overhaul the Web Market Scanner UI for improved readability, prominence, and marketplace logo sizing.

---

## 1. Authentication & OAuth Configuration
- **Alias Resolution (`src/lib/auth/social.ts`)**: Added support for all naming variants in Infisical and `~/.secrets/global-api-keys` (`DD_WEB_GOOGLE_ID`, `DD_WEB_GOOGLE_SECRET`, `DEALDEX_X_CLIENT_ID`, `DEALDEX_X_CLIENT_SECRET`, `APPLE_CLIENT_ID`, etc.).
- **Native Client Configs**:
  - `native/ios/DealDex/GoogleService-Info.plist` (sourced from `dealdex-google-auth.plist`).
  - `native/android/app/google-services.json` (sourced from `dealdex-android-google-auth.json`).
- **Login UI (`src/routes/login.tsx`)**: Upgraded social sign-in buttons with official brand SVG icons (Google, Apple, X) and clean full-width styling.

---

## 2. Web Scan UI Redesign (`src/components/scanner.tsx`, `src/components/market-logo.tsx`)
- **Primary SCAN Button**: Replaced cramped sidebar button with an integrated, high-contrast, prominent **⚡ SCAN MARKET** button with animated spinning state when active.
- **Live Scanning Feedback Banner**: Added pulsing feedback bar indicating real-time marketplace querying and spread scoring when a scan is in progress.
- **Marketplace Source Toggles**: Refined `MarketplaceToggle` with generous padding, glowing active indicator dots, full-color official eBay and Mercari logos, and live hit count badges.
- **Filter Layout**: Reorganized 6 filter selectors (Verdict, Max Ask, Condition, Min Discount, Finish, and Hide Proxies switch) into a balanced, spacious grid with clear Quick View tabs.

---

## 3. Verification & Build
- **Web Verification**:
  - `npm test` — 78/78 tests passed.
  - `npm run lint` — 0 errors.
  - `npm run typecheck` — 0 errors.
  - `npm run build` — Clean production build.
- **iOS Simulator Target**:
  - `xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex -destination 'generic/platform=iOS Simulator' build` -> **BUILD SUCCEEDED**.
- **Android Target**:
  - `./gradlew :app:assembleDebug --no-daemon` -> **BUILD SUCCESSFUL**.
  - Refreshed `public/DealDex.apk`.
