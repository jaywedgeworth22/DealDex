# 2026-08-19 — Official DealDex wordmark (in-app / web only)

Updated: Wed, Aug 19, 2026 (CURSOR)

## Asked

Apply Jay's official DealDex **wordmark** (red "Deal" + blue "Dex", yellow
outer badge, black inner stroke, slight upward arch) as the in-app and web
title mark.  Do **not** turn this — or the earlier double-D JPEG — into the
home-screen AppIcon / Android launcher / store 1024 icon.  That mark comes
in a follow-up when Jay sends the separate "DD" icon.

## What changed

- `public/marks/dealdex-wordmark.png` — official title wordmark (PNG).
- `public/marks/dd.svg` — clean SVG derivative of the same title mark
  (not a "DD" monogram).
- `src/components/app-mark.tsx` — `DealDexWordmark` for header / login.
  The Settings "Wordmark" chip uses the same PNG.
- `src/components/shell.tsx` and `src/routes/login.tsx` — official wordmark
  replaces the small chip + serif "DealDex" title.
- `scripts/og-dealdex.html` + `public/og.jpg` — marketing card uses the
  wordmark.  Paper / white field so the mark is not boxed on a dark card.
- `scripts/wordmark.test.mjs` — PNG + SVG + header/login wiring.

## Left alone on purpose

- iOS AppIcon / `Assets.xcassets` (none added).
- Android `mipmap` / adaptive launcher (`ic_delta` stays).
- `public/favicon.svg` and `public/__grok/icon-180.png` (PWA / favicon
  wait on the separate home-screen DD mark).
- Bundle `online.dealdex`, team `CC8UTF7ATG`, Android `me.grok.dealdex`.
- eBay / Mercari marketplace logos.

## Verify

```bash
npm test -- scripts/wordmark.test.mjs
npm run lint
npm run typecheck
```
