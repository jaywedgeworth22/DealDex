import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PWA_UPDATE_COPY } from "@/lib/pwa-update";
import { applyServiceWorkerUpdate, dismissServiceWorkerUpdate, onServiceWorkerUpdateReady } from "@/lib/pwa";

export function PwaUpdateBanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => onServiceWorkerUpdateReady(setReady), []);

  if (!ready) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[min(36rem,calc(100%-2rem))] rounded-lg border border-border bg-elevated p-4 text-fg shadow-[var(--shadow-border)]"
    >
      <p className="font-display text-lg">{PWA_UPDATE_COPY.title}</p>
      <p className="mt-1 text-sm text-muted">{PWA_UPDATE_COPY.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => void applyServiceWorkerUpdate()}>
          {PWA_UPDATE_COPY.reload}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={dismissServiceWorkerUpdate}>
          {PWA_UPDATE_COPY.notNow}
        </Button>
      </div>
    </div>
  );
}
