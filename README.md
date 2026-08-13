# DealDex

Pokémon listing desk. Scan live eBay and Mercari Buy It Now singles, then score the ask against TCGPlayer, Cardmarket, TCGCSV, eBay solds, and optional paid desks (JustTCG, PriceCharting, pokemontcg.io).

Website name: **DealDex**. Android and iPhone apps scan on the device. They do not wrap the website. API keys live on the phone; sign-in is optional if you want a backup.

## Source of truth

GitHub **`main`** is the product: [jaywedgeworth22/DealDex](https://github.com/jaywedgeworth22/DealDex).

Anyone working on DealDex — this preview, another Grok chat, Claude, Cursor, Copilot — must:

1. `git pull --rebase origin main`
2. Make the change
3. `git commit` and `git push origin main`

Vercel ships `main` to the live site. Import the repo once at
[vercel.com/new/import](https://vercel.com/new/import?s=https://github.com/jaywedgeworth22/DealDex)
if it is not already connected. Full loop: [CONTRIBUTING.md](CONTRIBUTING.md).

## Web

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

Stack: React 19, TanStack Start, Tailwind v4, Better Auth.

- `/` live scan
- `/settings` API keys (device first; account backup when signed in)
- `/alerts` deal alerts
- `/saved` ledger
- `/install` Android APK + native source
- `/login` Google, X, or email

## Native

See [`native/README.md`](native/README.md).

- Android package `me.grok.dealdex`, launcher name DealDex
- iOS project `native/ios/DealDex.xcodeproj`, display name DealDex

## Valuation

Free desks run without a key. Paste keys in Settings (web) or Keys (phone). Conflict means the core desks disagree by more than ~35% — check the dossier before you buy.

Not affiliated with TCGPlayer, eBay, Mercari, PriceCharting, or Pokémon.
