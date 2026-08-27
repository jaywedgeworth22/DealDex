# 2026-08-26 — CLAUDE — Full-app review remediation

Branch `claude/full-app-evaluation-893vtd`, based on `2440dc9` (`main` after #200).

The owner asked for a full evaluation of the website, backend, iOS app and
Android app, then asked for every finding to be fixed.  This note records what
changed and, more importantly, what still needs a machine this session did not
have.

## The through-line

Almost every serious finding was the same shape: something was written down
before it was built, and the writing was never revisited.  The privacy policy,
the iOS scanner screen, the alert channels, the install-page mock and the "on
the device" framing in three separate files all described behaviour the code did
not have.  The infrastructure underneath — auth hardening, the PGLite/Neon
parity layer, the ship pipeline — is careful work.  The gap between the two is
what this branch closes.

## Fixed

### Claims that were not true

| Claim | Where it appeared | Reality | Fix |
|---|---|---|---|
| "They do not send those keys to DealDex servers" | `/privacy`, README, `/settings` | both clients POSTed all three paid desk keys to `/api/native/scan` on every scan, as the **primary** path | on-device is now primary, the site fallback sends no keys, and the endpoint **refuses** a `keys` payload so it cannot regress |
| website keys "stay on this device" | `/settings` | a web scan runs server-side, so saved keys are sent with each request | disclosed explicitly, and the two surfaces are now described separately |
| "Card & Slab Scanner" | iOS `ScanView` | `simulateScan()` set `"Charizard"` / `"4/102"` after 1.2 s; no `AVCaptureSession`, no `NSCameraUsageDescription` | screen removed |
| "Email, SMS, and Pushover use the destinations you add" | `/alerts` | the server recorded email and SMS as `ok: true` without attempting a send | both disabled in the UI, reported honestly by the server, failures surfaced to the user |
| "iOS 16+" | `/install` | `IPHONEOS_DEPLOYMENT_TARGET` is 17.0 | corrected |

### Valuation

- **The matcher was circular.**  `pickScanCard` broke ties on how close a card's
  market price sat to the listing's own ask, so the ask decided which card it
  was and that card then decided whether the ask was a deal.  Now ranks on match
  evidence only and returns *no card* below `MIN_MATCH_SCORE` (40) rather than
  pricing against a guess.  Both phone clients had the same rule.
- **`scoreMatch` counted the listing's own words.**  The overlap test accepted
  tokens found in `parsed.title`, which every candidate matched equally.  A
  single generic set word ("Series") was also worth 12 points, which is how a
  Charmander promo was matched to a Pokémon Fan Club trainer card.
- **Grade never reached the book.**  Graded eBay comps were scored against a raw
  seed median, so a vintage-holo PSA 10 (≈8× raw) was discarded as an outlier.
  Quotes now carry `basisUsd`, their raw-equivalent, and the gate reads that.
- **"Desks Differ" fired on one desk.**  Conflict compared the lowest and highest
  quote regardless of source; TCGPlayer publishes market, mid and direct-low.
  Quotes carry a `desk` and conflict is measured between desks.
- **`HP` is hit points.**  `t.contains("hp")` on both phones treated the stat as
  Heavily Played and cut the book to 35 % on a large share of every scan; `lp`
  matched "Delphox", `mp` matched "champion".  The web used word boundaries but
  still misfired on "Charizard 120 HP".
- `decodeHtml` had five self-replacements (`&` → `&`) that never decoded
  anything; `gradeMultiplier` collapsed BGS/CGC/ACE 10 onto PSA 10; the range
  top used `mid` over `high`; shipping was read across a 700-character chunk
  that spilled into the next listing.

### Security

- Native sign-in redirected a **live session token** into `dealdex://auth`.
  Custom schemes are not exclusive on Android.  Now PKCE-style: the redirect
  carries a single-use code, and `/api/native/exchange` requires a verifier that
  never leaves the device (`migrations/0006`).
- Credentials moved to EncryptedSharedPreferences (Android) and the Keychain
  (iOS), with one-time migrations.  `allowBackup` is false and backup rules
  exclude the credential file.
- Desk API keys are encrypted at rest (`secret-box.ts`, AES-256-GCM, key derived
  from `BETTER_AUTH_SECRET` via HKDF).  Legacy plaintext rows still read, and
  re-encrypt on next save — no data migration needed.
- `dispatchRemoteAlerts` was an unauthenticated relay that would POST a
  caller-supplied title, message and URL to Pushover.  Now same-site gated,
  strictly validated, URL-restricted to marketplace links, and rate limited.
- `saveAppraisal` had `(input) => input` as its validator and a client-supplied
  primary key.  Validated, bounded, and the PK is scoped to `(user_id, id)`
  (`migrations/0005`).
- Rate limits on both scan entry points; `scan_cache` gains a TTL sweep, a row
  cap, and a paid-desk key so one user's paid book is not served to another.

### Build and release

- `npm ci` failed on the committed lockfile while `vercel.json` runs exactly
  that command; CI papered over it with `npm install`.  Lockfile refreshed, CI
  restored to `npm ci`, workaround comment deleted.
- Android was `targetSdk 34`, below the API 35 Play has required since Aug 2025.
  Now 35 with edge-to-edge declared, R8 on for release with keep rules, and a
  signing config sourced from CI env vars.
- Notification permission is requested when the user enables alerts, not at cold
  start.

### Testing

This is the change that keeps the rest closed.  `npm test` ran 97 tests, all of
which read source files as text and grepped them — nothing exercised a price, a
spread or a verdict.  `scripts/ts-alias-hook.mjs` teaches plain `node` the `@/*`
alias, so `src/**/*.test.ts` can import the real functions.  51 new tests cover
`appraise`, `scoreBook`, `parse-listing`, `match`, `vs-book` and the html
helpers.  Two of them caught bugs while being written.

The native guard tests were rewritten: they used to pin a comment string
(`"Scan never requires sign-in"`).  They now pin the properties that matter —
on-device-first ordering, no `keys` in the site payload, `code` not `token` in
the redirect, keystore usage, and the absence of the camera screen.

## NOT verified in this session — needs a Mac and an Android SDK

This session had neither Xcode nor the Android SDK, so the Swift and Kotlin
changes are **compile-unverified**.  Before shipping either app:

1. `cd native/ios && xcodegen generate` — `CameraScannerView.swift` was deleted
   and its four `project.pbxproj` entries were removed by hand.  Regenerating
   should produce the same result; confirm it does.
2. `xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
   -destination 'generic/platform=iOS Simulator' build`
3. `cd native/android && ./gradlew :app:assembleDebug` and `:app:assembleRelease`
   — R8 is newly enabled and `androidx.security:security-crypto` is a new
   dependency.
4. Exercise sign-in on a real device on both platforms.  The handoff contract
   changed on both ends at once; a mismatch shows up only at runtime.
5. Screenshot the iOS Scan tab: the camera button is gone and the search field
   now spans the row.

Deliberately deferred, with reasons:

- **Custom Tabs on Android.**  Sign-in still opens the default browser via
  `ACTION_VIEW`.  PKCE already makes an intercepted redirect useless, so this is
  a polish item rather than a hole.  Adding `androidx.browser` was not worth the
  unverifiable build risk in the same change.
- **`public/DealDex.apk`.**  Still a committed 17 MB binary that grows `.git`
  on every refresh.  It should move to a GitHub Release asset, but this session
  could not build a replacement, and deleting it would break the documented
  `/install` download.
- **The rate limiter is per-instance.**  On Vercel the effective ceiling is
  `limit × warm instances`.  It stops one client hammering one instance; it is
  not a global quota.  Said so in the file.

## Verification run here

`npx tsc --noEmit` clean · `npx eslint .` 0 errors, 8 pre-existing warnings ·
`npm test` 155/155 · `npm run build` green · `npm ci` succeeds against the
refreshed lockfile · homepage rendered at 1440×1250 and 390×900 with no console
errors.

The two layout defects from the review (clipped Mercari toggle, truncated mobile
selects) were already fixed upstream by #190's scanner rebuild; re-checked at
both widths and confirmed resolved.
