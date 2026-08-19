# DealDex native apps

Android and iPhone apps. They talk to eBay, Mercari, TCGDex, JustTCG, PriceCharting, and pokemontcg.io **from the phone**. The website is optional.

Keys you paste in **Settings** live on the device. If the website is down, scan still uses those keys.

**Settings** also has optional sign-in. Use the same email as the website only when you want to copy keys to or from your account.

## Android

**Sideload the debug APK** from the DealDex Apps page, or build it:

```
cd native/android
JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || echo /opt/homebrew/opt/openjdk@17)"
ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
ANDROID_HOME="$ANDROID_HOME" JAVA_HOME="$JAVA_HOME" ./gradlew :app:assembleDebug --no-daemon
```

The repo ships a Gradle 8.7 wrapper.  Point `local.properties` `sdk.dir` at your Android SDK (copy `local.properties.example`).  Need JDK 17.

- Package `me.grok.dealdex`, min SDK 26, target 34.
- Launcher name: DealDex.

## iOS

1. From `native/ios`, run `xcodegen generate` after editing `project.yml`.
2. Open `ios/DealDex.xcodeproj` in Xcode 15+ (team `CC8UTF7ATG`).
3. Run on a phone or simulator.

```
xcodebuild -project native/ios/DealDex.xcodeproj -scheme DealDex \
  -destination 'generic/platform=iOS Simulator' build
```

Bundle id: `online.dealdex`.  Display name: DealDex.  Team: `CC8UTF7ATG`.  Apple bundle resource id `R2FAW69NPD` is not a team id.
