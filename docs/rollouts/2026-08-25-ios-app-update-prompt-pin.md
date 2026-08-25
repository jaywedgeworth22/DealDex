# 2026-08-25 — Pin AppUpdatePrompt.swift; move Apple IDs off Swift

Seat: CURSOR.  Branch: `cursor/ios-app-update-prompt-pin-525d`.

Jay asked for one pinned `AppUpdatePrompt.swift` copied into the iOS
target from the in-repo ios-fleet pin.  No Swift package.  testers.json
untouched.  No `--force-ship`.  No spend.

## Pin

`scripts/ios-fleet/AppUpdatePrompt.swift` is the in-repo pin.  The iOS
target `native/ios/DealDex/AppUpdatePrompt.swift` is a byte-identical
copy.  Behavior stays the portable fleet check: silent on DEBUG /
Xcode / screenshots; TestFlight opens TestFlight; App Store opens the
App Store; Failures stay silent.

`knownAppleIds` is gone.  The fleet pin had been carrying stale
`online.dealdex`.  Apple IDs now live in:

- `scripts/ios-fleet/apps.json` — live DealDex `net.dealdex` /
  `6802474288`
- `jaywedgeworth22/ios-app-versions` `versions.json` — already has
  `net.dealdex` with the same appleId (not rewritten here; a one-app
  PUT would wipe sibling fleet apps)
- Info.plist / `project.yml` `AppUpdateAppleId` `6802474288` as the
  local fallback `fromBundle()` already reads

Do not treat `online.dealdex` as the live bundle.  Do not upload
`me.grok.dealdex`.

## Keepout

DealDex #183 Datadog / Vercel keys stay HOLD.

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Linux preview cannot run Xcode 26.  Pin and target compared with `cmp`.
