# DealDex

Pokémon listing desk. Scan live eBay and Mercari Buy It Now singles, then score the ask against TCGPlayer, Cardmarket, TCGCSV, eBay solds, and optional paid desks (JustTCG, PriceCharting, pokemontcg.io).

Website name: **DealDex**. Android and iPhone apps scan on the device. They do not wrap the website. API keys live on the phone; sign-in is optional if you want a backup.

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
