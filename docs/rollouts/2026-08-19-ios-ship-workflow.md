# 2026-08-19 — iOS TestFlight ship workflow

Updated: Wed, Aug 19, 2026 (CURSOR)

## Asked

Add a GitHub Actions iOS TestFlight ship workflow modeled on Socratic.Trade
and Congress.Trade.  Do not change the iOS bundle or team.  Do not upload
from this Linux agent.

## Identity (unchanged)

| What | Value |
|------|-------|
| Bundle ID | `online.dealdex` |
| DEVELOPMENT_TEAM | `CC8UTF7ATG` |
| Apple bundle resource ID | `R2FAW69NPD` (not a team id) |
| Fleet app key | `dealdex` |
| XcodeGen / scheme | `native/ios/project.yml` / `DealDex` |

## What landed

- `.github/workflows/ios-ship.yml` — push on `native/ios/**` + the workflow
  file, `workflow_dispatch`, cron `22,52` (offset from ST `*/30`, CT `7,37`,
  UM `13,43`).  Runner `[self-hosted, macOS, ARM64, xcode26]`.  Checkout
  `fetch-depth: 0`.  Calls `bash scripts/ios-ship-testflight.sh`.  Does not
  cancel in-progress ships.  Fork PRs never run.  No repo secrets.
- `scripts/ios-scheduled-ship-gate.sh` — cron skips unless `native/ios/`
  changed since the last successful ship.  Push / dispatch bypass the gate.
- Offline gate tests + a workflow-contract test so Ubuntu CI can catch a
  broken skip without a Mac.

PR: https://github.com/jaywedgeworth22/DealDex/pull/85

## Not done

- No TestFlight / ASC upload from this seat.  The Mac runner is what ships,
  and only after Jay creates the ASC app DealDex (SKU `dealdex`).
- Bundle, team, Android package, and app source are untouched.
