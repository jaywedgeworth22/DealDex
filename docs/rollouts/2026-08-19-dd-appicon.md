# 2026-08-19 — Official DD home-screen AppIcon + TestFlight rejects

Updated: Wed, Aug 19, 2026 (CURSOR)

## Asked

Add the official DealDex home-screen icon (overlapping glossy red + blue
bubble-letter Ds, thick yellow 3D rim, white background) across iOS,
Android, and web.  Fix the two TestFlight rejects from the 2026-08-18
`online.dealdex` archive.  Do not replace the in-app wordmark (PR #86).

## TestFlight rejects (2026-08-18 archive)

1. Missing AppIcon: no 120×120 iPhone icon, no 152×152 iPad icon, missing
   Info.plist `CFBundleIconName`.
2. iPad multitasking (Apple 90474): orientations must include Portrait,
   PortraitUpsideDown, LandscapeLeft, LandscapeRight.

## What changed

- Source 1024: `native/brand/dealdex-dd-icon-1024.png`.  Resize with
  `python3 scripts/generate-app-icons.py` (Pillow, on-demand).
- iOS `DealDex/Assets.xcassets/AppIcon.appiconset` — full iPhone + iPad
  set including 120 (`Icon-60@2x`), 152 (`Icon-76@2x`), and 1024
  marketing.
- `Info.plist` — `CFBundleIconName` = `AppIcon`.  Both orientation arrays
  include PortraitUpsideDown and the two landscapes.
- `project.yml` — `ASSETCATALOG_COMPILER_APPICON_NAME` and
  `INFOPLIST_KEY_CFBundleIconName`.  Regenerated `DealDex.xcodeproj` with
  XcodeGen 2.44.1 (`xcodegen generate` from `native/ios`).
- Android adaptive launcher (`@drawable/ic_launcher_foreground` on white)
  plus mdpi–xxxhdpi `ic_launcher` / `ic_launcher_round` mipmaps.  Package
  stays `me.grok.dealdex`.
- Web: `public/favicon.svg` embeds the DD; `public/__grok/icon-180.png`
  is the 180 PWA / apple-touch icon.
- Tests: `scripts/app-icon.test.mjs`.
- Docs: `STATUS.md`, `docs/EFFORT-LOG.md`, `native/ios/CLAUDE.md`,
  `native/README.md`, `docs/store-listing.md`.

## Left alone

- In-app / header wordmark (`src/components/app-mark.tsx`, PR #86).
- Bundle `online.dealdex`, team `CC8UTF7ATG`.  Resource id `R2FAW69NPD`
  is not a team id and does not appear in the pbxproj.
- No TestFlight / ASC upload.

## Verify

```bash
# Catalog + plist
rg -n 'CFBundleIconName|PortraitUpsideDown' native/ios/DealDex/Info.plist
rg -n 'Assets.xcassets|ASSETCATALOG_COMPILER_APPICON_NAME' \
  native/ios/project.yml native/ios/DealDex.xcodeproj/project.pbxproj
python3 - <<'PY'
from struct import unpack
from pathlib import Path
for rel, n in [
    ("native/ios/DealDex/Assets.xcassets/AppIcon.appiconset/Icon-60@2x.png", 120),
    ("native/ios/DealDex/Assets.xcassets/AppIcon.appiconset/Icon-76@2x.png", 152),
    ("native/ios/DealDex/Assets.xcassets/AppIcon.appiconset/Icon-1024.png", 1024),
    ("public/__grok/icon-180.png", 180),
]:
    data = Path(rel).read_bytes()
    w, h = unpack(">II", data[16:24])
    assert w == h == n, (rel, w, h)
print("ok")
PY
npm test
# Mac only
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```
