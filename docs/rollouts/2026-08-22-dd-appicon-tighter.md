# 2026-08-22 — Owner DD AppIcon (scaled) + isolated favicon

Updated: Sat, Aug 22, 2026 (GROK)

## Asked

Scale the tighter 3D DD photo into AppIcon pixel slots.  Isolated transparent
DD is the favicon.  Do not invent a background.

## What landed

- AppIcon / Android / PWA 180: the owner 1024 PNG, resized to each slot.
  Source `native/brand/dealdex-dd-icon-1024.png`.  No compositing.
- Favicon 16/32/ICO/SVG: isolated transparent DD
  (`native/brand/dealdex-dd-isolated.png`).  Black in previews is alpha.
  Cache-bust `?v=dd-isolated-20260822`.
- Generator only resizes those two sources.

Dark metallic mock is not shipped.  Site heading wordmark is unchanged.

## GitHub App (ST, same session)

Coolify GitHub App id `4238447` is unused.  ST/CT/UM use SSH deploy keys and
`https://host.jays.services/webhooks/source/github/events/manual`.  Safe to
delete that GitHub App.  It is not the Socratic.Trade login OAuth App.

## Verify

```
python3 scripts/generate-app-icons.py
npm run lint && npm run typecheck && npm test && npm run build
```
