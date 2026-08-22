# 2026-08-21 DealDex Power Enhancements & Cross-Platform Parity

## Scope & Objective
Deliver full cross-platform parity and power features across Web (`React 19 / TanStack Start`), iOS (`SwiftUI / Vision`), and Android (`Jetpack Compose`), expanding DealDex from a basic listing scanner into an end-to-end Pokémon arbitrage desk.

---

## 1. Web Core Valuation & UX
- **Grading Arbitrage Matrix**: Calculates raw vs PSA 10 / PSA 9 grading yield, factoring in standard submission costs (\$22), target grade multipliers, and estimated seller fees to flag high-upside raw singles (`worthGrading`).
- **Real-World Net Margins**: Replaced gross discount heuristics with realistic net profit calculations factoring in 11.25% market fees, shipping, and raw condition multipliers.
- **Proxy & Mystery Repack Heuristic**: Added regex detection identifying suspicious proxy/fan-made cards, mystery packs, and bulk repacks, surfacing a `Repack / Proxy` warning badge and an optional toggle to filter them out of live feeds.
- **1-Tap Deal Sharing**: Added a share button in the scanner and evaluator copying formatted markdown deal badges to clipboard.

---

## 2. Native iOS Enhancements
- **Card Dossier (`CardDossierView.swift`)**: Displays high-res card artwork, multi-finish pricing breakdowns, Cardmarket EUR trend comps, direct external links to TCGPlayer, eBay Solds, and Mercari, and a 1-tap jump to Evaluator.
- **Listing Evaluator (`EvaluatorView.swift`)**: Interactive ad-hoc listing calculator allowing users to select Condition (`NM`, `LP`, `MP`, `HP`, `DMG`), Grade (`Raw`, `PSA 10`, `PSA 9`, `BGS 10`, etc.), ask price, and shipping to evaluate spreads and slab upside.
- **Saved Deal Ledger (`SavedStore.swift` + `SavedView.swift`)**: Local `UserDefaults` ledger allowing collectors to track saved appraisals with status tracking (`Watching`, `Bought`, `Passed`) and swipe-to-delete.
- **Camera & Slab OCR (`CameraScannerView.swift`)**: Integrated Apple Vision OCR scanning to parse card names and collector numbers from physical cards and slab labels.
- **Navigation (`DealDexApp.swift`)**: Updated TabView with 5 full tabs (Scan, Evaluator, Saved, Alerts, Settings).

---

## 3. Native Android Enhancements
- **Card Dossier (`CardDossierScreen.kt`)**: Dedicated Compose screen for card comps, multi-finish market rates, and marketplace links.
- **Evaluator (`EvaluatorScreen.kt`)**: Jetpack Compose evaluator supporting real-time spread calculations, net margins, and PSA 10 upside highlights.
- **Saved Ledger (`SavedScreen.kt`)**: Saved deal ledger with segmented status filter chips and full item management.
- **Bottom Navigation (`MainActivity.kt`)**: Integrated bottom navigation across Scan, Evaluator, Saved, Alerts, and Settings.
- **Listing Actions (`ScanScreen.kt`)**: Added 1-tap Card Dossier opening and bookmarking to saved ledger directly on scan cards.

---

## 4. Verification Results
- **Web App**:
  - `npm run lint` -> Passed (0 errors).
  - `npm run typecheck` -> Passed (0 errors).
  - `npm test` -> Passed (72 / 72 passing tests).
  - `npm run build` -> Passed (Vite + TanStack Start + Nitro production build clean).
- **iOS App**:
  - `xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex -destination 'generic/platform=iOS Simulator' build` -> **BUILD SUCCEEDED**.
- **Android App**:
  - `./gradlew :app:assembleDebug --no-daemon` with OpenJDK 17 and Android SDK 34 -> **BUILD SUCCESSFUL**.
