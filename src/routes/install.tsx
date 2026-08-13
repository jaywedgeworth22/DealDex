import { createFileRoute } from "@tanstack/react-router";
import { Download, FolderCode } from "lucide-react";
import { NativePhones } from "@/components/native-phones";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/install")({ component: InstallPage });

function InstallPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Native apps</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Android and iPhone</h1>
      <p className="mt-3 max-w-xl text-pretty text-muted">
        Two real apps. Kotlin + Jetpack Compose on Android. SwiftUI on iPhone. They scan eBay
        and Mercari on the device and call TCGDex plus any paid APIs you keyed — they do not
        need this website. This is not a Home Screen shortcut and not a WebView.
      </p>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[auto_1fr]">
        <NativePhones />
        <div className="min-w-0 space-y-4">
          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl tracking-tight">Android APK</h2>
            <p className="mt-2 text-sm text-muted">
              Debug-signed Kotlin app. Install unknown apps for this browser, then open the
              file. First launch scans all Pokémon listings.
            </p>
            <div className="mt-4">
              <Button asChild>
                <a href="/dealdex-android-debug.apk" download>
                  <Download />
                  Download Android APK
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">
              me.grok.dealdex · Android 8+ · 16 MB · not a Play Store build
            </p>
          </article>
          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl tracking-tight">iOS + source</h2>
            <p className="mt-2 text-sm text-muted">
              SwiftUI Xcode project plus the Android Studio project. Open
              ios/DealDex.xcodeproj on a Mac, pick your team, run on a phone or simulator.
              There is no sideload IPA without Apple signing.
            </p>
            <div className="mt-4">
              <Button variant="secondary" asChild>
                <a href="/dealdex-native-src.zip" download>
                  <FolderCode />
                  Download Kotlin + Swift source
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">me.grok.dealdex · iOS 16+ · Xcode 15</p>
          </article>
        </div>
      </div>
    </Shell>
  );
}
