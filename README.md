# DealDex

Pokémon listing desk.  Scan live eBay and Mercari Buy It Now singles, then score the ask against TCGPlayer, Cardmarket, TCGCSV, eBay solds, and optional paid desks (JustTCG, PriceCharting, pokemontcg.io).

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

The hostname the app itself emits is `dealdex.online` (`VITE_PUBLIC_HOSTNAME` default in `src/routes/__root.tsx`).  That host was checked on 2026-08-20: HTTP 200, title DealDex, Vite `/assets/*.js` (same hashed bundle as the GitHub-linked Vercel `main` alias).  The old GitHub About homepage `https://dealdex-psi.vercel.app` still served that same DealDex build.  It is a working alias, not a second product.  `https://dealdex.vercel.app` is a different Next.js site titled "DealDeX - Revolutionizing E-commerce" and is not this repo.  Coolify is not wired.

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
