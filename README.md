# DealDex

Identify Best-Priced Pokémon Card Listings.  Scan live eBay and Mercari Buy It Now singles, then score the ask against TCGPlayer, Cardmarket, TCGCSV, eBay solds, and optional paid desks (JustTCG, PriceCharting, pokemontcg.io).

Website name: **DealDex**.  Android and iPhone apps scan on the device.  They do not wrap the website.  API keys live on the phone; sign-in is optional if you want a backup.

## Source of truth

GitHub **`main`** is the product: [jaywedgeworth22/DealDex](https://github.com/jaywedgeworth22/DealDex).  The repo is public.  Work lands through a pull request.  Do not push straight to `main`.

Anyone working on DealDex (this preview, another Grok chat, Claude, Cursor, Copilot) must:

1. `git fetch origin && git rebase origin/main`
2. Make the change on a seat branch
3. Open a PR and merge when CI is green

Full loop: [CONTRIBUTING.md](CONTRIBUTING.md).

## Website

The website is optional.  The phone apps do not wrap it.

This repo's web app is React 19, TanStack Start, Tailwind v4, and Better Auth (Vite).  It is not Next.js, Expo, React Native, or Capacitor.

**Public host: https://dealdex.net on Vercel.**  Vercel is current, not a leftover.  GitHub About homepage is that URL.  Do not use `dealdex-psi.vercel.app` as the homepage.  Do not migrate the site to Coolify.

The app's default `VITE_PUBLIC_HOSTNAME` is `dealdex.net`.  Owner registered that name 2026-08-22 (Namecheap).  Point it at the existing Vercel project `dealdex` and redirect `dealdex.online`.  `https://dealdex.vercel.app` is a different Next.js site titled "DealDeX - Revolutionizing E-commerce" and is not this repo.

Do not invent another live URL.

## Web (local)

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

- `/` live scan
- `/settings` API keys (device first; account backup when signed in)
- `/alerts` deal alerts
- `/saved` ledger
- `/install` Android APK + native source
- `/login` Google, X, or email
- `/privacy` store privacy page

## Native

See [`native/README.md`](native/README.md).  Both apps talk to eBay, Mercari, and the price desks from the device.

- Android: Kotlin + Jetpack Compose, package `me.grok.dealdex`, launcher name DealDex, Gradle 8.7 wrapper.  Sideload the debug APK from `/install` or assemble it locally.  Play Console credentials are not in this repo.
- iOS: `native/ios/DealDex.xcodeproj` (XcodeGen spec `native/ios/project.yml`), bundle `online.dealdex`, display name DealDex, team `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is not a team id.  The App Store Connect app record (SKU `dealdex`) does not exist yet.  Do not upload to TestFlight until Jay creates that record.

## Valuation

Free desks run without a key.  Paste keys in Settings (web) or Keys (phone).  Conflict means the core desks disagree by more than ~35% — check the dossier before you buy.

Not affiliated with TCGPlayer, eBay, Mercari, PriceCharting, or Pokémon.

## License

Apache License 2.0.  See [`LICENSE`](LICENSE).
