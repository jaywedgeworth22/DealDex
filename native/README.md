# DealDex native apps

Android and iPhone apps. They talk to eBay, Mercari, TCGDex, JustTCG, PriceCharting, and pokemontcg.io **from the phone**. The website is optional.

Keys you paste in **Keys** live on the device. If the website is down, scan still uses those keys.

**Account** is optional. Sign in with the same email as the website only when you want to copy keys to or from your account.

## Android

**Sideload the debug APK** from the DealDex Apps page, or build it:

```
cd native/android
ANDROID_HOME=… ./gradlew :app:assembleDebug --no-daemon
```

- Package `me.grok.dealdex`, min SDK 26, target 34.
- Launcher name: DealDex.

## iOS

1. Open `ios/DealDex.xcodeproj` in Xcode 15+.
2. Set your Development Team on the target.
3. Run on a phone or simulator.

Bundle id: `me.grok.dealdex`. Display name: DealDex.
