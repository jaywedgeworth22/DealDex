import { createFileRoute } from "@tanstack/react-router";
import { Download, FolderCode } from "lucide-react";
import { NativePhones } from "@/components/native-phones";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Lead } from "@/components/lead";

export const Route = createFileRoute("/install")({ component: InstallPage });

function InstallPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">Native apps</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Android and iPhone</h1>
      <Lead>
        Two phone apps.  They scan eBay and Mercari on the device, score each ask against the
        desks, and keep working if this website is down.  A scan never sends a paid desk key to a
        DealDex server.
      </Lead>

      {/*
        This is the honest version of a page that would otherwise describe one
        build and hand out another. The APK and source zip in `public/` were
        committed before the privacy and security work landed, and could not be
        rebuilt in the session that changed the source. Saying so beats letting
        someone download a binary on the strength of a promise it does not keep.
      */}
      <aside className="mt-6 max-w-2xl rounded-xl border border-deal-bad/40 bg-surface p-4 text-sm shadow-[var(--shadow-border)]">
        <h2 className="font-medium text-deal-bad">These downloads are an older build</h2>
        <p className="mt-1 text-muted">
          The files below were built before the current privacy and security changes.  That build
          still sends your paid desk keys to the scan endpoint and keeps them in unencrypted device
          storage, and its sign-in returns a session token on a URL scheme other apps can claim.
          Build from source if you want the current behaviour — a refreshed APK is pending.
        </p>
      </aside>

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
                <a href="/DealDex.apk" download="DealDex.apk">
                  <Download />
                  Download Android APK
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">Android 8+ · 17 MB · not a Play Store build</p>
          </article>
          <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl tracking-tight">iPhone</h2>
            <p className="mt-2 text-sm text-muted">
              Download the source, open the iOS project on a Mac, pick your team, and run it
              on a phone or simulator. Apple does not allow an unsigned download.
            </p>
            <div className="mt-4">
              <Button variant="secondary" asChild>
                <a href="/DealDex-source.zip" download="DealDex-source.zip">
                  <FolderCode />
                  Download Android + iPhone source
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">iOS 17+</p>
          </article>
        </div>
      </div>
    </Shell>
  );
}
