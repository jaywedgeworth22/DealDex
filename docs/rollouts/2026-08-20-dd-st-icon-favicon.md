# 2026-08-20 — Transparent DD favicon + ST-grid iOS AppIcon

Updated: Thu, Aug 20, 2026 (CURSOR)

## Asked

Use the transparent interlocking DD as the tab favicon.  Drop the
rectangular box around the site heading.  Make the iOS AppIcon the DD on
the Socratic.Trade tiled field (the attached ST icon's background, with
no candlesticks or leftover artifacts).

## What changed

- Removed the leftover global `img { outline }` in `src/styles.css` that
  boxed every image, including the header wordmark.  Wordmark img is
  `block` + `outline-none`.
- Tab icon is `public/favicon.ico` plus 16/32 PNG with a real alpha
  channel.  Safari was falling back to a letter tile because the old
  favicon was a huge SVG wrapping an opaque PNG.
- iOS `AppIcon.appiconset` (and Android mipmaps / PWA 180) is the DD on a
  reconstructed ST tiled field: corner lighting from Jay's ST icon,
  32px recessed grout, oval ground shadow, no candlesticks.
- Rebuild: `python3 scripts/generate-app-icons.py`.

## Left alone

- In-app / header wordmark artwork (same 3D DealDex title).
- Bundle `online.dealdex`, team `CC8UTF7ATG`.
- No TestFlight / ASC upload.

## Verify

```
npm run lint
npm run typecheck
npm test
npm run build
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```
