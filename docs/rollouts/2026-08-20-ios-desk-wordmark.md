# 2026-08-20 — iOS desk + glossy 3D title wordmark

Updated: Thu, Aug 20, 2026 (GROK)

## Asked

Make the iPhone desk usable unsigned, fill Xcode Identity (DealDex, iOS 18.0,
Xcode 26.3), match website eBay/Mercari chips (official wordmarks in white),
add Google sign-in, and replace the website/app **title** with Jay's glossy
3D DealDex mark.  He also sent the interlocking DD.  Do not swap the live
home-screen AppIcon until he picks an icon-options variant.

## What changed

- `public/marks/dealdex-wordmark.png` — owner 3D title, transparent field.
- `public/marks/dealdex-dd.png` — isolated interlocking DD (not live launcher).
- `src/components/app-mark.tsx` / `shell.tsx` / `login.tsx` — header + login.
- `public/og.jpg` — paper OG card with the new title.
- iOS `DealDexWordmark.imageset` + `DealDexTitle` on Scan.
- iOS `MarketplaceMarks.swift` — official eBay four-color / Mercari paths,
  white fills on olive/charcoal chips (website `MarketplaceToggle`).
- iOS 18.0, Xcode 26.3 (`xcodegen-post.py` objectVersion 100), display name
  DealDex, `AuthenticationServices`, `dealdex://` Google OAuth.
- `POST /api/native/scan` public.  Scan does not require a session.
- Android Scan uses `dealdex_wordmark` drawable.
- AppIcon options in `native/brand/icon-options/` (not swapped live).

## Left alone on purpose

- Live `AppIcon.appiconset` / Android mipmaps / favicon (white-field DD).
- ASC / TestFlight upload (no DealDex SKU yet).

## Verify

```bash
npm test -- scripts/wordmark.test.mjs scripts/ios-identity.test.mjs scripts/native-scan.test.mjs
xcodegen generate   # from native/ios
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'platform=iOS Simulator,id=9130DAC2-8622-456D-A952-DA10D420A614' build
```
