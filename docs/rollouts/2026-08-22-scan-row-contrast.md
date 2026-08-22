# 2026-08-22 — Scan box contrast, SCAN, Hide Proxies

Portrait website layout stayed.  Tweaks only.

- Filter headings centered over the dropdowns.  Closed-state select values
  centered (`text-align-last: center`).
- LIVE MARKET SCAN shifted 1ch right.
- Brown button is SCAN, 2.5x the old 14px label, no radar icon.  Spinner
  only while the scan is running.
- Hide Proxies is a plain checkbox.  The REPACKS heading and the matching
  dropdown border are gone.
- Light muted/subtle/border tokens darkened so 12px labels clear AA on cream.
- iOS ScanView: same 3x2 filters, SCAN, Hide Proxies, Verified chip.
- Account Website helper: leave `https://dealdex.online`.  Scan already
  uses that host if the field is empty.

## Verify

```
npm run lint && npm run typecheck && npm test && npm run build
curl -sS http://127.0.0.1:8080/ | grep -E "SCAN|Hide Proxies|REPACKS|Radar"
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -configuration Debug build
```

SSR HTML: SCAN present, Hide Proxies present, REPACKS absent, Radar absent.
iOS `BUILD SUCCEEDED`.  Did not reinstall on the owner's already-booted
simulators after SpringBoard crashed on an install attempt.
