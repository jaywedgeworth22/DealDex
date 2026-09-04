# 2026-09-03 — AppUpdatePrompt reads ai-fleet-coordinator

Owner is deleting `jaywedgeworth22/ios-app-versions`.  Personal-Site does not
link it.  Pin + `native/ios/DealDex/AppUpdatePrompt.swift` stay
byte-identical.  `publish-ios-versions.sh` seeds and PUTs
`jaywedgeworth22/ai-fleet-coordinator` `site/ios-versions.json`.

## Verification

```bash
node --test scripts/ios-identity.test.mjs
```
