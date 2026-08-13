export function isFramed() {
  return typeof window !== "undefined" && window.parent !== window;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as { standalone?: boolean }).standalone))
  );
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function shouldRegisterSw() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    import.meta.env.PROD &&
    !isFramed()
  );
}

export function registerServiceWorker() {
  if (!shouldRegisterSw()) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  });
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<(ready: boolean) => void>();

export function listenForInstallPrompt() {
  if (typeof window === "undefined" || isFramed()) return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((fn) => fn(true));
  });
}

export function onInstallReady(fn: (ready: boolean) => void) {
  listeners.add(fn);
  fn(Boolean(deferred));
  return () => {
    listeners.delete(fn);
  };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const choice = await deferred.userChoice;
  deferred = null;
  listeners.forEach((fn) => fn(false));
  return choice.outcome === "accepted";
}

export function canPromptInstall() {
  return Boolean(deferred);
}
