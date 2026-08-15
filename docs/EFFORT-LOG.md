# DealDex Effort Log — cross-agent board
Protocol: /Users/jay/apps/EFFORT-LOG-PROTOCOL.md (canonical). Live board: this file
(mirror: docs/EFFORT-LOG.md in the repo). As of 2026-08-14.

## Deployed
- **2026-08-14 — GROK-BUILD — DEPLOYED — Vercel project dealdex (PR #47).** Linked to GitHub `main`.  Production READY: https://dealdex-git-main-jaywedgeworth22s-projects.vercel.app/ (HTTP 200, DealDex scan page).  No custom domain.

## Completed
- **2026-08-15 — GROK — IN PR — Point DealDex AGENTS.md at Mac background-jobs master list (branch `grok/mac-process-list`).**  Canonical `~/apps/MAC-LOCAL-PROCESSES.md` + pinned Note.
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
- (none)

## Planned / Reserved
- **2026-08-14 — GROK — PLANNED — TestFlight + App Store + Play upload.** Blocked on owner: ASC app record (SKU `dealdex`, Account Holder create) and Google Play Console credentials.  Bundle ID `me.grok.dealdex` is registered.  Prep landed in PR #56.

## Changelog of this log
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
