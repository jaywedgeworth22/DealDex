# 2026-08-22 — Native publish + website scan scoring

Seat: CURSOR.  Branch: `cursor/native-publish`.

Android previously scored listings only on-device (Jina + TCGdex).  It now calls `POST /api/native/scan` on `https://dealdex.net` first, so phone results use the same desk as the website.  Empty origin still defaults to that host.  On-device scrape remains the fallback if the site returns nothing.

Scan chrome on Android matches the live site and iOS: large SCAN, verdict/price/condition/spread/finish filters, Hide proxies, All / Deals / Verified.

iOS was already on `dealdex.net` and `/api/native/scan`.  Marketing version in XcodeGen is 1.0.2.  ios-fleet `dealdex.bundleId` is `net.dealdex` so TestFlight upload matches the Xcode project.

Sideload: copy debug APK to `public/DealDex.apk` (Play Console still needs owner credentials).
