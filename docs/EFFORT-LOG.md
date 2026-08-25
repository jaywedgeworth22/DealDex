# DealDex Effort Log — cross-agent board
Protocol: /Users/jay/apps/EFFORT-LOG-PROTOCOL.md (canonical). Live board: this file
(mirror: docs/EFFORT-LOG.md in the repo). As of 2026-08-22.

**Canonical public host is `https://dealdex.net`.**  `dealdex.online` is the redirect leftover, not the product name.  Do not invent DNS.

> ⚠️ **AGENT AVAILABILITY NOTICE (2026-08-21):** KIMI is **RETIRED / UNAVAILABLE** long-term (owner directive). All agents MUST NOT assign work or wait on KIMI in-flight work. Reassign any open KIMI effort board lanes or GitHub issues to active seats (AG, GROK, CLAUDE, MONET, etc.).

## In Progress
- **2026-08-25 — CURSOR — IN PROGRESS — Android Play + PWA skippable update alerts.**  Branch `cursor/android-pwa-update-alerts-c953`.  Play In-App Updates on open; PWA reload banner when a waiting worker exists.  No ios-fleet / testers / invite-on-ship.
- **2026-08-25 — CURSOR — IN PROGRESS — Accept dealdex in vendored ship-testflight.sh case + usage (ios-ship run 32791798491).**  Branch `cursor/ios-ship-dealdex-case-5bfb`.  Keep macos-latest.  No --force-ship.  No secrets YAML.
- **2026-08-24 — AG — IN PROGRESS — Switch iOS CI & Actions workflows to GitHub-hosted cloud macOS runners (branch `antigravity/cloud-ios-actions-runners`).** Update ios-ship.yml to runs-on macos-latest (free unlimited minutes on public repo), and update Xcode assertion.

## Deployed
- **2026-08-22 — CURSOR — PICKUP GROK — Analytics already live; remaining Autorotate (`autorotate.codes`, GitHub TopSpin) + DealDex.net copy is Cursor Auto.**  Grok is no longer owner.  Board comment on DealDex #129.
- **2026-08-22 — GROK — DEPLOYED — Vercel Web Analytics (#128 squash `148780af`).**  Canonical check is https://dealdex.net (was documented on dealdex.online).  Privacy discloses cookie-less page views.  Board `e65921a0`.
- **2026-08-21 — CURSOR — DEPLOYED — #118 / #117 scan layout + subtitle.**  https://dealdex.net homepage HTML includes Identify Best-Priced Pokémon Card Listings.  `og.jpg?v=subtitle-20260821` is the new 92437-byte JPEG (Vercel 200).  Squash `5474ef1`.
- **2026-08-14 — GROK-BUILD — DEPLOYED — Vercel project dealdex (PR #47).** Linked to GitHub `main`.  Production READY: https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app/ (HTTP 200, DealDex scan page).  No custom domain.
## Completed
- **2026-08-22 - GROK - COMPLETED - Point DealDex production at dealdex.net.**  Landed DealDex #136.  Canonical host dealdex.net in code.  Cursor 2026-08-22: live `https://dealdex.net` HTTP 200; `https://dealdex.online` redirects.  Do not invent DNS. <!-- wb-agent-report:b16e5c7409b147288f5b958bf895c54d -->
- **2026-08-22 - GROK - COMPLETED - Android + PWA use isolated DD.**  Merged #132. Scan over eBay/Mercari; Android/PWA isolated DD. <!-- wb-agent-report:2d4aff5cad2847eb807cfd03e41f999a -->
- **2026-08-22 - GROK - COMPLETED - Tighter DD AppIcon on ST grid.**  Merged #130. AppIcon is the owner 1024 PNG resized. Favicon is the isolated transparent DD. <!-- wb-agent-report:3b2d4b881f214f88abc49a658626b6ee -->
- **2026-08-21 — CURSOR — COMPLETED/MERGED #113 / #112 — Transparent DD favicon + ST-grid AppIcon.**  Safari PNG/ICO interlocking DD.  Header `img` outline removed.  iOS/Android launcher is DD on the ST tiled field (no candlesticks).  PR #113 squash `493e88a`.
- **2026-08-20 — GROK — COMPLETED/MERGED #103 — iOS desk + 3D title wordmark.**  Official olive eBay/Mercari source chips (website SVG sizes + even-odd holes).  Jay's glossy DealDex title on header/login/OG/iOS/Android.  Isolated DD stored; live AppIcon not swapped.  Unsigned `POST /api/native/scan`, Google `dealdex://`, iOS 18 / Xcode 26.3.  Production heading cache-busted `?v=3d-20260820`.
- **2026-08-20 — GROK — COMPLETED — PR babysit rebase #85 + #93.**  Lane `~/apps/dealdex-grok-prfix`.  Force-with-lease onto current main.  #85 `59e9782` and #93 `748c7d4` are MERGEABLE/CLEAN, verify green.  Did not merge.  No TestFlight upload.  Keep runner `[self-hosted, macOS, ARM64, xcode26]`, path `native/ios/**`, app key `dealdex`.
- **2026-08-15 — GROK-BUILD — COMPLETED/MERGED #71 — Grok Vercel + GitHub + dealdex.online.** Live host is dealdex.online. Re-link on Grok Vercel if `main` is not auto-building.
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
- **2026-08-25 — CURSOR — IN PROGRESS — Android Play + PWA skippable update alerts.**  Branch `cursor/android-pwa-update-alerts-c953`.  Play In-App Updates on open; PWA reload banner when a waiting worker exists.  No ios-fleet / testers / invite-on-ship.
- **2026-08-25 — CURSOR — IN PROGRESS — Accept dealdex in vendored ship-testflight.sh case + usage (ios-ship run 32791798491).**  Branch `cursor/ios-ship-dealdex-case-5bfb`.  Keep macos-latest.  No --force-ship.  No secrets YAML.
- **2026-08-24 — CURSOR — IN PROGRESS — Put ios-ship back on GitHub-hosted macos-latest (protocol; no local Mac runner).**  Branch `cursor/ios-gh-hosted-runners-709e`.

## Completed
- **2026-08-22 — ANTIGRAVITY — COMPLETED — Build app under net.dealdex bundle, dealdex.net domain, sync iOS/Android/Favicon/ASC icons.**  Branch `ag/bundle-net-and-builds`, worktree `~/apps/dealdex-antigravity`.
- **2026-08-22 — ANTIGRAVITY — COMPLETED — DealDex.net domain, net.dealdex bundle ID, iOS 17 + Xcode 26 doc format + icons + dev team link, and Android build.**  Branch `ag/net-domain-and-ios-setup`, worktree `~/apps/dealdex-antigravity`.
- **2026-08-21 — ANTIGRAVITY — COMPLETED — Multi-platform power enhancements (Web, iOS, Android).**  Branch `ag/power-enhancements`, worktree `~/apps/dealdex-antigravity`.  Grading arbitrage & net flip calculators, repack filter, native iOS & Android Card Dossier, Evaluator, and Saved Ledger parity.
- **2026-08-21 — CURSOR — iOS first-launch update prompt (fleet) — COMPLETED/MERGED #122 squash `3b18d9a` (branch `cursor/ios-update-prompt-9992`, worktree `~/apps/dealdex-cursor-ios-update`).**  TestFlight opens TestFlight; App Store opens the App Store.  Manifest `jaywedgeworth22/ios-app-versions`.  Verify + Vercel green.
- **[DealDex][GROK] Fast-forward local main after Mac-storage prune — COMPLETED 2026-08-15.**  Discarded local Xcode pbxproj dirt (shopping category / LD_RUNPATH rewrite).  `git pull --ff-only` `58fcc12` → `6a686c1`.  0 open PRs.
## Planned / Reserved
- **2026-08-14 — GROK — PLANNED — TestFlight + App Store + Play upload.** Blocked on owner: ASC app record (SKU `dealdex`, Account Holder create) and Google Play Console credentials.  Bundle ID `me.grok.dealdex` is registered.  Prep landed in PR #56.
## Changelog of this log

- 2026-08-25 — CURSOR: reserved Android Play + PWA skippable update alerts (`cursor/android-pwa-update-alerts-c953`).
- 2026-08-25 — CURSOR: reserved dealdex case/usage fix for vendored ship-testflight.sh (`cursor/ios-ship-dealdex-case-5bfb`).
- 2026-08-24 — CURSOR: put ios-ship on GitHub-hosted macos-latest + ASC secret import (`cursor/ios-gh-hosted-runners-709e`).
- 2026-08-24 — CURSOR: vendor ios-fleet so hosted ships can resolve 1.0.N (`cursor/ios-ship-asc-version-709e`).
- 2026-08-22 — CURSOR: reserved OG logo-only social card (`cursor/og-logo-only-4780`).
- 2026-08-22 — CURSOR: reserved Vercel Speed Insights (`cursor/vercel-speed-insights-4a42`).
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
