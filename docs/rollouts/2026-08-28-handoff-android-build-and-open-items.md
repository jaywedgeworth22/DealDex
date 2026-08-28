# 2026-08-28 — CLAUDE — Handoff: the Android build, and everything else still open

Written from a Linux cloud container with **no Android SDK and no Xcode**.  That
constraint is the reason most of this list exists.  Everything below is either
work a machine with Android Studio can finish in an afternoon, or a decision
that needs a human.

Base at time of writing: `main` = `fac298a`.  My work landed as `121ea10`
(PR #203) and `21d7228` (PR #205); PR #208 (`ag/dd-privacy-policy-route`) is
open from another seat and does not overlap.

---

## 1. THE BIG ONE — Android has never been compiled

**Nothing has ever built `native/android` from this work.**  There is no Android
equivalent of `ios-ship.yml`, so unlike iOS — which the merge compiled on a real
Mac runner within minutes — the Kotlin has had no compiler look at it at all.
581 changed lines across 13 files, entirely unverified.

Toolchain the module pins (all satisfied by a current Android Studio; its
bundled JBR covers the JDK requirement):

| | |
|---|---|
| Gradle | 8.7 (wrapper) |
| AGP | 8.6.1 |
| Kotlin | 1.9.24 |
| Compose BOM | 2024.06.00, compiler ext 1.5.14 |
| compileSdk / targetSdk | 35 |
| minSdk | 26 |
| Java | source/target 17 |

### Step 1 — does it compile

```bash
cd native/android
ANDROID_HOME=~/Library/Android/sdk ./gradlew :app:assembleDebug --no-daemon
```

If this fails it is a plain Kotlin error and mine to own.  The files most likely
to hold one, because they were rewritten most heavily:

- `data/Prefs.kt` (+160) — the `SecretStore` interface, `EncryptedStore` /
  `MemoryStore`, the `by lazy` keystore init, and `migrateLegacy`
- `data/Appraise.kt` (+123) — the condition and grade fixes ported from the web
- `data/NativeAuth.kt` (+86) — PKCE
- `data/Market.kt` (+54) — on-device-first scan ordering

### Step 2 — the release build, which is the one that matters

```bash
ANDROID_HOME=~/Library/Android/sdk ./gradlew :app:assembleRelease --no-daemon
```

**R8 is enabled here for the first time**, in the same change that adds
`androidx.security:security-crypto`.  That combination is the single most
dangerous thing in this branch.  Tink registers its key managers *reflectively*
over shaded protobuf types; R8 in full mode strips them; then
`EncryptedSharedPreferences.create` throws at runtime — release-only, silently.

`app/proguard-rules.pro` has keep rules for exactly this.  They are unverified.

Without a keystore in the environment `assembleRelease` still builds, just
unsigned — that is deliberate (`app/build.gradle.kts`), not a bug.

### Step 3 — the runtime check no build can give you

A green `assembleRelease` does **not** prove the keep rules worked.  R8 strips
at runtime.  Install the **release** APK on a device and:

1. Sign in.  Add a paid desk key in Settings.
2. Force-stop the app.  Reopen it.
3. **The session and the key must still be there.**

If they are gone, `EncryptedSharedPreferences.create` threw and `Prefs` fell
back to `MemoryStore`.  That failure is *by design* — losing a session beats
writing the token and all three desk keys to a plaintext file, which is what an
earlier version of my own fix would have done — but it means the keep rules need
widening.  Losing the session on every relaunch is the symptom to watch for.

### Step 4 — three more device checks

- **Notifications on a fresh install (Android 13+).**  The default alert rule
  ships enabled, so the switch renders already ON and `onCheckedChange` never
  fires; the Alerts screen asks for `POST_NOTIFICATIONS` on arrival instead.
  Verify on a *clean* install, not an upgrade.
- **Sign-in, then rotate the device mid-flow.**  `onCreate` used to re-handle the
  launching intent and spend the single-use code twice, replacing a good session
  with "Sign-in expired".
- **Upgrade path for credentials.**  Install an older build, sign in, then
  upgrade.  `migrateLegacy` must move the token and keys into the encrypted
  store and only latch `securedV1` once every value reads back.

### Step 5 — refresh the shipped APK

`public/DealDex.apk` is **17.8 MB and dates from PR #190 (2026-08-25)**.  It
predates every fix on this branch: that binary still POSTs desk keys to the scan
endpoint on every scan, keeps them unencrypted, and takes a session token on a
URL scheme any app can claim — under an `/install` page that now promises
otherwise.  The page says so explicitly right now, which is honest but not a
fix.  Rebuild and replace it.

(Related, and worth doing at the same time: that 17 MB binary is committed to
git and grows `.git` on every refresh.  It belongs in a GitHub Release asset.
Moving it means updating the `/install` download link.)

---

## 2. iOS — compiles and shipped, but the scanner is unproven

`ios-ship.yml` run #212 archived on real Xcode (`** ARCHIVE SUCCEEDED **`) and
shipped **1.0.59 (202608272038)** to TestFlight internal testing.  So the Swift
compiles, and Swift autolinking pulled in VisionKit and AVFoundation with no
`project.yml` `dependencies:` entry — **do not add them**.

**Nobody has pointed a real iPhone at a card.**  `DataScannerViewController` does
not run in the Simulator, so a green archive says nothing about whether the
scanner works.  On the TestFlight build:

1. Point it at a card.  The lines under the viewfinder must be that card's real
   text, and the button must fill in the real name.
2. Point it at a blank surface.  The button must stay disabled and read "No card
   name read yet" — it must not offer anything.
3. Deny camera permission once.  The Settings copy must appear, not a black view.
4. Try a card whose **set name is printed larger than the Pokemon's name**.  This
   is the documented failure mode: `cardName(in:)` takes the tallest recognised
   line, so the set name can win.

Smaller iOS items:

- **Version record is stale.**  `project.yml` and `project.pbxproj` both say
  `1.0.2 (202608230250)`; `1.0.59 (202608272038)` shipped.  They agree with each
  other, so I left both alone — syncing needs `xcodegen generate`, which needs a
  Mac.  The ship script passes both values on the `xcodebuild` line regardless,
  so this is a records chore, not a build problem.
- **Testers get no release notes.**  `IOS_TF_RELEASE_NOTES=1` is unset, so the
  ship rendered notes as a DRY RUN only.  Set it if you want notes published.
- **`version-manifest publish failed (non-fatal)`** in run #212.  Worth a look.
- **Split the scanner out.**  `CardScannerView` lives inside `ScanView.swift`
  only because a new `.swift` file needs `xcodegen generate` on a Mac and
  hand-editing `project.pbxproj` is forbidden.  Once you are regenerating
  anyway, move it to its own file.

---

## 3. Decisions that need a human, not a build

- **App Links / Universal Links.**  This is the real fix for native sign-in and
  the most valuable remaining security work.  Sign-in still returns on a
  private-use URI scheme, which RFC 8252 §8.1 says any app may claim.  The
  server-issued single-use `state` closes the one-request attack and the
  tap-through blocks a silent background completion, but an app can still start
  its own flow.  The proper fix is Android App Links (`autoVerify` +
  `/.well-known/assetlinks.json`) and iOS Universal Links
  (`apple-app-site-association` + an Associated Domains entitlement).
  **Blocked on two things I cannot produce:** a release signing certificate
  fingerprint (there is no release keystore yet) and an entitlement change
  (`native/ios/CLAUDE.md` forbids hand-editing entitlements).
  iOS is materially safer meanwhile — `ASWebAuthenticationSession` delivers the
  callback to the session that opened it.
- **Custom Tabs on Android.**  Sign-in opens the default browser via
  `ACTION_VIEW`.  Adding `androidx.browser` was not worth stacking unverifiable
  build risk into the same change, and it does not close the item above anyway.
- **The rate limiter is per-instance.**  On Vercel the effective ceiling is
  `limit x warm instances`.  It stops one client hammering one instance; it is
  not a global quota.  Said so in the file.
- **Android has no card scanner at all.**  It never had the fake one either.  A
  CameraX + ML Kit text-recognition equivalent of the iOS `CardTextReader` is a
  clean, self-contained piece of work if you want feature parity.
- **No Android ship workflow.**  iOS has `ios-ship.yml` doing archive + upload on
  a hosted macOS runner, which is why iOS got compiled and Android did not.  A
  matching Ubuntu workflow running `assembleRelease` would have caught anything
  in section 1 before it reached `main`.  I would rank this above the scanner.

---

## 4. What I would do first

1. `./gradlew :app:assembleDebug` — five minutes, and it either clears 581 lines
   of unverified Kotlin or hands you the errors.
2. `./gradlew :app:assembleRelease`, then the **install-and-relaunch** check in
   section 1 step 3.  That is the one that catches the R8/Tink trap.
3. Point a phone at a Pokemon card (section 2).
4. Then decide on the Android CI workflow, because it prevents this whole
   situation recurring.

---

## Provenance

Everything above is either read out of the repo at `fac298a` or taken from the
logs of `ios-ship.yml` run 33114261668.  Nothing here is inferred from a build I
did not run: the container that produced this branch had neither the Android SDK
nor Xcode, and where something is unverified this note says so rather than
guessing.
