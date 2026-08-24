# 2026-08-22 — Public host dealdex.net

## Why

Owner registered `dealdex.net` (Namecheap, coupon used at checkout).  `.net` is the public name.  `dealdex.online` stays as a redirect.

## What

- Default `VITE_PUBLIC_HOSTNAME` is `dealdex.net`.
- Native iOS `NativeAuth.defaultOrigin` and Android placeholders use `https://dealdex.net`.
- Store listing privacy/support URLs use `https://dealdex.net`.
- Do not put `dealdex.online` → `dealdex.net` in `vercel.json` until
  `dealdex.net` is on the Vercel project and TLS is green.  #136's host-wide
  308 sent `/api/*`, `/privacy`, and `/card/*` to a Namecheap park.
- iOS bundle stays `online.dealdex`.  Android stays `me.grok.dealdex`.

## DNS (owner)

Namecheap already has NS `dns1.registrar-servers.com` (same as `dealdex.online`).

1. Vercel → project `dealdex` → Domains → add `dealdex.net` and `www.dealdex.net`.
2. Copy the A / CNAME Vercel shows into Namecheap Advanced DNS for `dealdex.net` (apex A is currently `216.198.79.1` on `.online`).
3. After TLS is green, add the `dealdex.online` → `https://dealdex.net` redirects.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After DNS: `curl -sSI https://dealdex.net` and `curl -sSI https://dealdex.online` (expect 301 to `.net`).
