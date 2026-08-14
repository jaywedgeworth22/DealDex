# 2026-08-14 — Native iOS + Android compile

Updated: Fri, Aug 14, 2026 at 3:50 PM CT (GROK)

## Context & Objective

Owner asked to build the iOS and Android apps.  Lane `~/apps/dealdex-grok`
on `grok/native-builds` from `origin/main`.

## What built

- **Android:** `./gradlew :app:assembleDebug` succeeded.  APK
  `native/android/app/build/outputs/apk/debug/DealDex-debug.apk` (16 MB)
  copied to `public/DealDex.apk` for the install page.
- **iOS:** Sources compile.  Installed `me.grok.dealdex` on the booted
  iPhone 17 Pro simulator and screenshot the Scan tab (light theme,
  eBay / Mercari chips, Scan / Alerts / Settings).

## Why the project files changed

The Android tree had no Gradle wrapper, so the documented `./gradlew`
command did not exist.  `setProperty("archivesBaseName", …)` also fails
on current Gradle.  Added a Gradle 8.7 wrapper and
`base.archivesName.set("DealDex")`.

The iOS tree had no shared scheme.  Xcode 26 printed
"Supported platforms for the buildables in the current scheme is empty"
and `xcodebuild` stalled at `clang -v -E -dM` (Swift Build waiting on a
full pipe).  Added `native/ios/project.yml` and ran `xcodegen generate`
so the pbxproj + shared scheme come from the spec.  Do not hand-edit
`project.pbxproj`.  On this Mac, if `xcodebuild` still hangs at that
clang probe, `swiftc` + `simctl install` is the fallback used this
turn.

## Not done

- App Store Connect / TestFlight.  Team `CC8UTF7ATG` is set in the
  XcodeGen spec; no ASC app record yet.
- First-run notification sheet still appears (expected).  A bad first
  install briefly showed `$(PRODUCT_NAME)` after XcodeGen rewrote
  Info.plist; the plist is restored to **DealDex**.
