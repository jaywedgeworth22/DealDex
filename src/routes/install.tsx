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
        Two phone apps. They scan eBay and Mercari on the device, score each ask against the
        desks, and keep working if this website is down.
      </p>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[auto_1fr]">
        <NativePhones />
        <div className="min-w-0 space-y-4">
          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl tracking-tight">Android APK</h2>
            <p className="mt-2 text-sm text-muted">
              Allow installs from this browser, then open the file. First launch scans all
              Pokémon listings.
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
              Android 8+ · 16 MB · not a Play Store build
            </p>
          </article>
          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl tracking-tight">iPhone</h2>
            <p className="mt-2 text-sm text-muted">
              Download the source, open the iOS project on a Mac, pick your team, and run it
              on a phone or simulator. Apple does not allow an unsigned download.
            </p>
            <div className="mt-4">
              <Button variant="secondary" asChild>
                <a href="/dealdex-native-src.zip" download>
                  <FolderCode />
                  Download Android + iPhone source
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">iOS 16+</p>
          </article>
        </div>
      </div>
    </Shell>
  );
}
