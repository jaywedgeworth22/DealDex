# DealDex Effort Log — cross-agent board
- **2026-09-01 — GROK — IN PROGRESS — Datadog Free-tier: canonicalize `DD_ENV=prod` to `production` (board `ad678866`, branch `grok/datadog-free-tier`, worktree `~/apps/dealdex-grok-datadog-free`).**  Rollout: `docs/rollouts/2026-09-01-datadog-free-tier.md`.
- **2026-09-01 — GROK — IN PROGRESS — Sentry DSN hygiene: no hardcoded iOS fallback (branch `grok/sentry-dsn-hygiene`, worktree `~/apps/dealdex-grok-sentry-dsn`).**  Board `7e18a8e4bb75488ca891a94d84033679`.  Cocoa init is plist-only / build-injected; empty DSN = no-op.
Protocol: /Users/jay/apps/EFFORT-LOG-PROTOCOL.md (canonical). Live board: this file
(mirror: docs/EFFORT-LOG.md in the repo). As of 2026-08-22.

**Canonical public host is `https://dealdex.net`.**  iOS bundle is `net.dealdex`.  Android package is `me.grok.dealdex`.  Do not invent DNS.

> ⚠️ **AGENT AVAILABILITY NOTICE (2026-08-21):** KIMI is **RETIRED / UNAVAILABLE** long-term (owner directive). All agents MUST NOT assign work or wait on KIMI in-flight work. Reassign any open KIMI effort board lanes or GitHub issues to active seats (AG, GROK, CLAUDE, MONET, etc.).

## In Progress
- **2026-09-01 — GROK — IN PROGRESS — Android official Sentry SDK (crash+ANR, no default PII) (board c56621e1, worktree `~/apps/dealdex-grok-sentry-android` @ `grok/sentry-android`).**  Owner un-deferred Android.  Card/desk data stays out of events.
- **2026-09-01 - GROK - IN_PROGRESS - Vercel auto-deploys skip unless site files changed, plus 1/hour (branch `grok/vercel-site-watch`, worktree `~/apps/dealdex-grok-vercel-watch`).**  Board `46837afd`.  Ignores docs/native/ios/.github so those commits do not ship dealdex.net.
- **2026-09-01 — GROK — COMPLETED — Cap automatic Vercel deploys to one production build per hour.**  Board `9051c3ac`.  PR #244.  Follow-up is site-file watch on `grok/vercel-site-watch`.
- **2026-09-01 — GROK — IN PROGRESS — Vendor ios-fleet ship-testflight (dSYM/Size Analysis/SENTRY_DSN inject) + ios-ship SENTRY_* (branch `grok/sentry-dsym`, worktree `~/apps/dealdex-grok-sentry-dsym`, board `88650b3f`).**  No force-ship.
- **2026-09-01 — GROK — IN PROGRESS — Add fleet sentry-ci-report.yml + scripts/sentry-ci-report.py (branch `grok/sentry-ci-report`, worktree `~/apps/dealdex-grok-sentry-ci`, board `b667e612`).**  Gold copy UM PR #1394.  APP=`dealdex`.  Fingerprint `[ci-failure, dealdex, workflow]`.  <!-- wb-agent-report:b667e612 -->
- **2026-09-01 — GROK — IN PROGRESS — Sentry production deploy records (`sentry-cli releases deploys new -e production`) (branch `grok/sentry-deploys`, worktree `~/apps/dealdex-grok-sentry-deploys`, board `2d1c8565`).**  Vercel integration creates release SHAs but leaves them `(unreleased)` — workflow added (not skipped).  VERSION = full git SHA.  Soft-fail.
- **2026-09-01 — GROK — IN PROGRESS — Sentry fleet adoption: Vercel `VITE_SENTRY_DSN`, User Feedback widget, Replay 10% session kept, iOS DSN Info.plist-only, Android documented deferred (branch `grok/sentry-fleet-adoption`, worktree `~/apps/dealdex-grok-sentry-adopt`).**  Board `d3f01c60eb4f457c855af60b4c196706`.  Rollout: `docs/rollouts/2026-09-01-sentry-fleet-adoption.md`.
- **2026-09-01 — GROK — IN PROGRESS — Living identity is DealDex.net / net.dealdex (board 053cdba5, worktree `~/apps/dealdex-grok-audit` @ `grok/identity-net-dealdex`).**  README, PLAN, CONTRIBUTING, STATUS, native notes, tests, and audit identity block.  Android package stays `me.grok.dealdex`.
- **2026-09-01 — GROK — IN PROGRESS — Full-stack audit concurrence + Wave 0 (board 053cdba5, worktree `~/apps/dealdex-grok-audit` @ `grok/full-stack-audit`).**  Pull public APK/zip, robots/sitemap, drop SVG document titles.  Report: `docs/AUDIT-2026-09-01.md`.
- **2026-09-01 — GROK — IN PROGRESS — Add SentryTelemetry.swift to committed iOS Sources so TestFlight archive compiles (branch `grok/sentry-telemetry-pbxproj`, worktree `~/apps/dealdex-grok`).**  Scheduled ios-ship run 33524415676 red on `main` `ab1390e`: DealDexApp.swift cannot find SentryTelemetry in scope.  File on disk; pbxproj missing PBXBuildFile `6E68536A0591E1EAA8F9DF30` + PBXFileReference `BF5CF2870999472BC27D2F40` + group child + Sources phase.  Also add sentry-cocoa SPM membership the committed pbxproj lacked.  No extra-ship.  No `--force-ship`.  Board `9dd5fa7786a6428b9162000bc11c55a7`.  Rollout: `docs/rollouts/2026-09-01-sentry-telemetry-pbxproj.md`.
- **2026-09-01 — AG — IN PROGRESS — iOS Native Sentry Cocoa telemetry, crash reporting, and app-hang detection (branch `ag/ios-sentry-cocoa-expansion`).**  Integrates native Sentry Cocoa SDK into DealDex iOS to capture uncaught crashes, OOMs, and 2.0s app-hangs: added Sentry Cocoa SPM package dependency, implemented `SentryTelemetry.swift` for crash reporting and 0.2 distributed tracing, and wired into `DealDexApp.init()`. Gate: xcodegen clean, SPM resolved, typecheck clean, 197/197 tests clean. Rollout: `docs/rollouts/2026-09-01-ios-sentry-cocoa-expansion.md`.  **GROK 2026-09-01:** the Swift file and `project.yml` package landed on `main` (#219 / #222) but the committed `project.pbxproj` still omitted Sources membership and SPM `packageReferences`, which is why scheduled ios-ship is red.  Fix is the GROK row above; this AG row is not deleted.
- **2026-08-31 — AG — COMPLETED (merged to `main`) — Sentry client observability: Session Replay, error capture & distributed tracing (PR #217).**  Integrated `@sentry/react` client error monitoring, Session Replay (100% on error, 10% baseline session, privacy-masked), and distributed browser tracing in `src/lib/observability/sentry.ts` and `src/routes/__root.tsx`. Gated on `VITE_SENTRY_DSN`. Gate: typecheck clean, 197/197 tests clean. Rollout: `docs/rollouts/2026-08-31-sentry-client-observability.md`.
- **2026-08-28 — AG — IN PROGRESS — Fix Datadog 503 / Vercel secrets, PGlite WASM packaging, iOS unmodifiable dealdex.net origin & polished Google/Apple/X sign-in buttons.**  Branch `ag/auth-buttons-and-fixed-url`.  Configured missing production secrets on Vercel (`DD_API_KEY`, Better Auth, OAuth IDs), added `copy-pglite.mjs` for serverless function WASM assets, made iOS origin unmodifiable to `https://dealdex.net`, and added polished custom provider buttons matching CT/ST.
- **2026-08-27 — DEPLOYER — IN PROGRESS — Datadog web logs + APM + RUM (#183 rebase).**  Branch `cursor/datadog-web-observability-4edf`.  Infisical SOT.  Vercel machine identity only.  No extra-ship.
- **2026-08-26 — CLAUDE — IN PROGRESS — Full-app review remediation (branch `claude/full-app-evaluation-893vtd`).**  Owner asked for a full evaluation of website, backend, iOS and Android, then for every finding to be fixed.  Landed: valuation engine (circular matcher, grade never reaching the book, per-desk conflict detection, `decodeHtml` no-ops, HP-stat-as-condition on all three clients), native privacy (`/api/native/scan` now refuses desk keys; on-device is the primary scan path; `/privacy`, README, `/settings` and AGENTS.md corrected), PKCE native sign-in replacing a session token in a `dealdex://` redirect, keystore/Keychain credential storage, encrypted `desk_keys`, rate limits + `scan_cache` TTL, honest email/SMS alert state, Android targetSdk 35 + R8 + signing config, refreshed lockfile so CI runs the same `npm ci` Vercel does, and 51 new money-path tests (`src/**/*.test.ts`, previously zero).  **2026-08-27:** the fake iOS card scanner is no longer just deleted — `CardScannerView` runs VisionKit `DataScannerViewController` live text on the device, returns nil rather than a guess, and shows every recognised line before the user taps; `NSCameraUsageDescription` added to Info.plist *and* project.yml.  187/187 tests.  **Deployed 2026-08-27:** merged as `121ea10` (PR #203); `ios-ship` run #212 archived on real Xcode (`ARCHIVE SUCCEEDED` — the Swift compiles) and shipped `1.0.59 (202608272038)` to TestFlight internal testing.  Kotlin remains compile-unverified and the scanner is still unproven on a physical iPhone.  **Swift and Kotlin are compile-unverified — no Xcode or Android SDK in that session.**  See `docs/rollouts/2026-08-26-full-app-review-remediation.md` and `docs/rollouts/2026-08-27-ios-card-scanner.md` for the required build checks before either app ships — the scanner needs a **physical iPhone**, not the Simulator.

## Deployed
- **2026-08-31 — BF-FIXER — DEPLOYED — Removed redundant scanner intro and kept eBay/Mercari toggles on one mobile row.**  PR #213, squash `25ace11`, board `128f1e71`.  Live-verified on `https://dealdex.net` at 320px with two 124px source toggles, no removed copy, and no horizontal overflow.
- **2026-08-24 — AG — COMPLETED/MERGED #167 (`b6cad4d`) — Switch iOS CI & Actions workflows to GitHub-hosted cloud macOS runners (branch `antigravity/cloud-ios-actions-runners`).** Updated ios-ship.yml to runs-on macos-latest (free unlimited minutes on public repo), and updated Xcode version assertion. Full cloud CI suite green. Live SHA `b6cad4d`.
- **2026-08-22 — CURSOR — PICKUP GROK — Analytics already live; remaining Autorotate (`autorotate.codes`, GitHub Autorotate) + DealDex.net copy is Cursor Auto.**  Grok is no longer owner.  Board comment on DealDex #129.
- **2026-08-22 — GROK — DEPLOYED — Vercel Web Analytics (#128 squash `148780af`).**  Canonical check is https://dealdex.net.  Privacy discloses cookie-less page views.  Board `e65921a0`.
- **2026-08-21 — CURSOR — DEPLOYED — #118 / #117 scan layout + subtitle.**  https://dealdex.net homepage HTML includes Identify Best-Priced Pokémon Card Listings.  `og.jpg?v=subtitle-20260821` is the new 92437-byte JPEG (Vercel 200).  Squash `5474ef1`.
- **2026-08-14 — GROK-BUILD — DEPLOYED — Vercel project dealdex (PR #47).** Linked to GitHub `main`.  Production READY: https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app/ (HTTP 200, DealDex scan page).  No custom domain.
## Completed
- **2026-08-26 — ANTIGRAVITY — COMPLETED — Add Vercel free feature optimizations (branch `antigravity/vercel-optimizations`).**  Updated `vercel.json` with immutable 1-year cache-control headers for static build assets (`/assets/(.*)`), stale-while-revalidate caching for media/fonts/favicons, strict security headers (nosniff, sameorigin, referrer-policy, permissions-policy), clean URLs, and trailing slash normalization.
- **2026-08-25 — ANTIGRAVITY — COMPLETED — Configure Google/Apple/X OAuth from secrets & polish Scan UI button layout.**  Branch `ag/auth-and-scan-ui-polish`, worktree `~/apps/dealdex-antigravity`.
- **2026-08-23 — CURSOR — COMPLETED/MERGED #163 — Settings appearance 3-way + Google/Apple/X auth.**  Squash on main.  Grok broker and email/password removed.  Needs Vercel `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (and Apple/X if used) plus OAuth callback URLs.
- **2026-08-23 - CURSOR - COMPLETED - OG share: drop TCGPlayer, DealDex.net, enlarge title.**  PR #156: enlarged OG card, eBay·Mercari, dealdex.net, cache-bust share-20260823. <!-- wb-agent-report:9844c760d93b4f229185fabd07eb5867 -->
- **2026-08-23 — CURSOR — COMPLETED/MERGED #156 — OG share card.**  TCGPlayer dropped.  Footer eBay · Mercari + dealdex.net.  Wordmark ~400px tall, 48px subtitle.  Cache-bust `og.jpg?v=share-20260823`.  Squash `1e9a017`.  PR #154.  TestFlight `net.dealdex` 1.0.2 (202608230250) internal testers READY_FOR_BETA_TESTING.  Sideload APK on `/install` after Vercel Production.  Landed DealDex #136.  Canonical host dealdex.net in code.  Cursor 2026-08-22: live `https://dealdex.net` HTTP 200.  Do not invent DNS. <!-- wb-agent-report:b16e5c7409b147288f5b958bf895c54d -->
- **2026-08-22 - GROK - COMPLETED - Android + PWA use isolated DD.**  Merged #132. Scan over eBay/Mercari; Android/PWA isolated DD. <!-- wb-agent-report:2d4aff5cad2847eb807cfd03e41f999a -->
- **2026-08-22 - GROK - COMPLETED - Tighter DD AppIcon on ST grid.**  Merged #130. AppIcon is the owner 1024 PNG resized. Favicon is the isolated transparent DD. <!-- wb-agent-report:3b2d4b881f214f88abc49a658626b6ee -->
- **2026-08-21 — CURSOR — COMPLETED/MERGED #113 / #112 — Transparent DD favicon + ST-grid AppIcon.**  Safari PNG/ICO interlocking DD.  Header `img` outline removed.  iOS/Android launcher is DD on the ST tiled field (no candlesticks).  PR #113 squash `493e88a`.
- **2026-08-20 — GROK — COMPLETED/MERGED #103 — iOS desk + 3D title wordmark.**  Official olive eBay/Mercari source chips (website SVG sizes + even-odd holes).  Jay's glossy DealDex title on header/login/OG/iOS/Android.  Isolated DD stored; live AppIcon not swapped.  Unsigned `POST /api/native/scan`, Google `dealdex://`, iOS 18 / Xcode 26.3.  Production heading cache-busted `?v=3d-20260820`.
- **2026-08-20 — GROK — COMPLETED — PR babysit rebase #85 + #93.**  Lane `~/apps/dealdex-grok-prfix`.  Force-with-lease onto current main.  #85 `59e9782` and #93 `748c7d4` are MERGEABLE/CLEAN, verify green.  Did not merge.  No TestFlight upload.  Keep runner `[self-hosted, macOS, ARM64, xcode26]`, path `native/ios/**`, app key `dealdex`.
- **2026-08-15 — GROK-BUILD — COMPLETED/MERGED #71 — Grok Vercel + GitHub.** Live host is dealdex.net. Re-link on Grok Vercel if `main` is not auto-building.
- **2026-08-17 — GROK — COMPLETED — Effort-board hygiene.** Live In Progress already empty; landing this board as the repo mirror so stale GitHub `state:in-progress` issues close.
- **2026-08-16 — GROK — IN PR — Rename Apple Note pointer to `⭐️ Background Jobs Master List` (branch `grok/note-title`, worktree `~/apps/dealdex-grok-note-title`).**  AGENTS.md only.
- **2026-08-15 — GROK — COMPLETED/MERGED #61 — Point DealDex AGENTS.md at Mac background-jobs master list.**  Canonical `~/apps/MAC-LOCAL-PROCESSES.md` + pinned Note.
- **2026-08-14 — GROK — COMPLETED — Store-submit prep (PR #56).** Privacy page, listing copy, ship wrapper, export-compliance plist.  ASC CREATE forbidden for App Manager key.  Archive hung on Xcode 26 `clang -v`.
- **2026-08-14 — GROK — COMPLETED — Compile native iOS + Android apps (PR #50).** Gradle 8.7 wrapper + XcodeGen spec.  Debug APK in `public/DealDex.apk`.  iOS launched on iPhone 17 Pro sim.
- **2026-08-14 — GROK-BUILD — COMPLETED — Register Grok Build as a standing fleet seat (DealDex PR #41, fleet PR #26).** Mac lane `~/apps/dealdex-grok-build`.  `fleet-apps.json` has GROK-BUILD.  AGENT-SYNC seat table still for Mac Grok (keepout this turn).
- **2026-08-14 — GROK — COMPLETED — Onboarding links + subagent/economics wording (PR #40).** AGENTS.md start-here table + stronger Delegation stanza.  Docs only.
- **2026-08-13 — GROK-BUILD — COMPLETED — White toggle wordmarks (PR #37).** Scan/alert source chips use solid white eBay/Mercari letters.  Listing-row marks stay full color.
- **2026-08-13 — GROK-BUILD — COMPLETED — Straighten the JustTCG J (PR #34).** Desk names use Plex.  Fraunces WONK=0.
- **2026-08-13 — GROK-BUILD — COMPLETED — Official eBay + Mercari wordmarks (PR #20).** Owner-supplied blue MERCARI mark replaces the red character.  eBay four-color wordmark kept.  Native Scan matches.
- **2026-08-13 — GROK-BUILD — COMPLETED — Join fleet as named seat.** Seat table + `grok-build/` prefix.  Preview lane is `/workspace`.  Same PR/CI/merge loop as every other seat.
- **2026-08-13 — GROK-BUILD — COMPLETED — Marketplace logos + ship path (PR #10).** eBay/Mercari marks on scan, alerts, native.  CONTRIBUTING documents GitHub `main` + one-time Vercel/Coolify import.
- **2026-08-13 — GROK — COMPLETED — iOS agent build-loop policy (PR #18).** `native/ios/CLAUDE.md` + AGENTS + Claude pbxproj hook.  xcodebuild via bash is pre-approved.
- **2026-08-13 — GROK — COMPLETED — Drop broken Auto Update PRs workflow.** `chinthakagodawita/autoupdate@v1.22.0` does not exist; it failed every main push.  Revisit with the Usage-Monitor `gh pr update-branch` pattern if DealDex grows stacked PRs.
- **2026-08-13 — GROK — COMPLETED — CI uses npm install (PR #3).** Main CI verify is green (lint/typecheck/test/build).
- **2026-08-13 — GROK — COMPLETED — Fleet onboard merged (PR #1).** `~/Code/DealDex` is `jaywedgeworth22/DealDex`.  AGENTS.md, effort board, Slack `repo: DealDex` / `DD`.
## In Progress

## Completed
- **2026-08-22 — ANTIGRAVITY — COMPLETED — Build app under net.dealdex bundle, dealdex.net domain, sync iOS/Android/Favicon/ASC icons.**  Branch `ag/bundle-net-and-builds`, worktree `~/apps/dealdex-antigravity`.
- **2026-08-22 — ANTIGRAVITY — COMPLETED — DealDex.net domain, net.dealdex bundle ID, iOS 17 + Xcode 26 doc format + icons + dev team link, and Android build.**  Branch `ag/net-domain-and-ios-setup`, worktree `~/apps/dealdex-antigravity`.
- **2026-08-21 — ANTIGRAVITY — COMPLETED — Multi-platform power enhancements (Web, iOS, Android).**  Branch `ag/power-enhancements`, worktree `~/apps/dealdex-antigravity`.  Grading arbitrage & net flip calculators, repack filter, native iOS & Android Card Dossier, Evaluator, and Saved Ledger parity.
- **2026-08-21 — CURSOR — iOS first-launch update prompt (fleet) — COMPLETED/MERGED #122 squash `3b18d9a` (branch `cursor/ios-update-prompt-9992`, worktree `~/apps/dealdex-cursor-ios-update`).**  TestFlight opens TestFlight; App Store opens the App Store.  Manifest `jaywedgeworth22/ios-app-versions`.  Verify + Vercel green.
- **[DealDex][GROK] Fast-forward local main after Mac-storage prune — COMPLETED 2026-08-15.**  Discarded local Xcode pbxproj dirt (shopping category / LD_RUNPATH rewrite).  `git pull --ff-only` `58fcc12` → `6a686c1`.  0 open PRs.
## Planned / Reserved
- **2026-08-14 — GROK — PLANNED — TestFlight + App Store + Play upload.** Blocked on owner: ASC app record (SKU `dealdex`, Account Holder create) and Google Play Console credentials.  Bundle ID `me.grok.dealdex` is registered.  Prep landed in PR #56.
## Changelog of this log

- 2026-08-23 — CURSOR: reserved login-social (appearance toggle + Google/Apple/X, drop Grok broker).
- 2026-08-23 — CURSOR: reserved OG share layout (`cursor/og-share-layout`).
- 2026-08-22 — GROK: reserved Vercel Web Analytics (`grok/vercel-analytics`).
- 2026-08-21 — CURSOR: deployed #118 / #117 (homepage subtitle + new og.jpg).
- 2026-08-21 — CURSOR: reserved #117 scan layout + OG wordmark + subtitle.
- 2026-08-21 — CURSOR: landed #113 / #112 transparent DD favicon + ST-grid AppIcon.
- 2026-08-20 — GROK: landed #103 iOS desk + 3D title; production heading is the owner 3D mark.
- 2026-08-20 — GROK: iOS desk + owner 3D title wordmark on grok/ios-desk (live AppIcon not swapped).
- 2026-08-20 — GROK: rebased conflicting PRs #85 (ios-ship) and #93 (effort-log pointer) onto main; did not merge.
- 2026-08-17 — GROK: board hygiene. Confirm In Progress empty; #71 recorded Completed; landing mirror.
- 2026-08-14 — GROK store-submit prep (#56); upload remains Planned (ASC create + Play creds).
- 2026-08-14 — GROK moved native iOS + Android compile to Completed (PR #50).
- 2026-08-14 — GROK reserved native iOS + Android compile (wrapper + XcodeGen).
- 2026-08-14 — GROK-BUILD reserved fleet seat registration; reconciled live board with origin/main mirror (did not delete GROK-BUILD rows).
- 2026-08-13 — GROK-BUILD reserved white toggle wordmarks.
- 2026-08-13 — GROK-BUILD reserved JustTCG J fix (Plex for desk names, Fraunces WONK=0).
- 2026-08-13 — GROK-BUILD reserved chip toggles + phone Settings.
- 2026-08-13 — GROK-BUILD reserved one page measure (drop text-pretty, max-w-7xl).
- 2026-08-13 — GROK-BUILD reserved copy wrap + guest line.
- 2026-08-13 — GROK-BUILD moved scan desk polish to Completed (PR #22).
- 2026-08-13 — GROK-BUILD reserved official marketplace wordmarks.
- 2026-08-13 — GROK-BUILD: this seat signs GROK-BUILD, not GROK.
- 2026-08-13 — GROK-BUILD reserved join-fleet; moved logos to Completed (PR #10).
- 2026-08-13 — GROK-BUILD reserved marketplace logos.
- 2026-08-13 — bootstrapped by GROK.
