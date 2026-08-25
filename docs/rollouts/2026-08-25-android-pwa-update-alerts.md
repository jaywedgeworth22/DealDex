# 2026-08-25 — Android Play + PWA skippable update alerts

Seat: CURSOR.  Branch: `cursor/android-pwa-update-alerts-c953`.

Jay asked every user-facing DealDex surface to alert on open when a newer
version exists.  Skippable only.  Not a min-version gate.

## Android

`MainActivity` checks Play In-App Updates on resume.  If Play reports
`UPDATE_AVAILABLE` and a flexible update is allowed, the app shows
Update Available with Update / Not Now.  Update starts a Play Core
flexible flow.  Not Now stores that version code and stays quiet.
Failures and “already current” stay silent.  Immediate / force-update
is not used.

## Web / PWA

`public/sw.js` still calls `skipWaiting()` and now honors a
`SKIP_WAITING` message from Reload.  The site watches for a waiting
(or just-installed) worker when a controller already exists, then
shows Update available / Reload / Not Now.  First install stays
silent.  The existing install prompt is unchanged.

## iOS / versions.json

Left `AppUpdatePrompt` alone.  Shipped bundle is `net.dealdex`, and
`knownAppleIds` already includes both `net.dealdex` and
`online.dealdex`.  `versions.json` is not in this repo.  Live file in
`jaywedgeworth22/ios-app-versions` (fetched, not cloned) has
`net.dealdex` at marketing `1.0.2` / build `202608230250`, and
`online.dealdex` still at `1.0.1`.  iTunes lookup for both bundle IDs
returns zero results.  Did not bump that file here.

Same PR now owns the durable standing-tester scripts: `testers.json`
lists `johnwedeworth@comcast.net` and `mail@jays.services` only.
`ship-testflight.sh` invites them after a successful upload via
`asc-api.mjs invite-testers`.  Idempotent.  Fail-soft.  ios-ship stays
on GitHub-hosted `macos-latest`.  No `--force-ship`.

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Manual: sideload Android stays silent (no Play).  Play build shows the
dialog only when a newer store version exists.  Production PWA shows
the banner after a new `sw.js` lands and a waiting/installed worker
exists; Reload applies it.
