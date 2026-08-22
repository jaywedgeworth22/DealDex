# 2026-08-22 — Scan desk layout + Android/PWA isolated DD

Scan button is dark brown (`--color-scan`), same width as the eBay/Mercari
column, with those toggles under it.  Verdict / Max Ask / Condition / Min
Discount / Finish / Hide Proxies sit 3 per row to the left.

Android and PWA 180 use the isolated transparent DD.  iOS AppIcon stays the
tiled owner 1024 PNG.

- Android mipmaps + adaptive foreground: `native/brand/dealdex-dd-isolated.png`
- PWA `public/__grok/icon-180.png`: same isolated mark
- iOS AppIcon: tiled owner 1024 PNG from #130

Adaptive background stays `#FFFFFF`.  Generator only resizes.

## Verify

```
python3 scripts/generate-app-icons.py
npm run lint && npm run typecheck && npm test && npm run build
```
