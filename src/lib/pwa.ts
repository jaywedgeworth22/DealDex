import { shouldOfferServiceWorkerUpdate } from "@/lib/pwa-update";

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

const PWA_UPDATE_DISMISS_KEY = "dealdex.pwaUpdate.dismissed";

const updateListeners = new Set<(ready: boolean) => void>();
let updateReady = false;

function isUpdateDismissed(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(PWA_UPDATE_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function setUpdateReady(ready: boolean) {
  if (updateReady === ready) return;
  updateReady = ready;
  updateListeners.forEach((fn) => fn(updateReady));
}

function offerFromRegistration(reg: ServiceWorkerRegistration) {
  if (
    shouldOfferServiceWorkerUpdate({
      hasController: Boolean(navigator.serviceWorker.controller),
      hasWaitingWorker: Boolean(reg.waiting),
      installingState: reg.installing?.state ?? null,
      dismissed: isUpdateDismissed(),
    })
  ) {
    setUpdateReady(true);
  }
}

function watchRegistration(reg: ServiceWorkerRegistration) {
  offerFromRegistration(reg);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    void reg.update().then(() => offerFromRegistration(reg)).catch(() => undefined);
  });
  reg.addEventListener("updatefound", () => {
    const installing = reg.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (
        shouldOfferServiceWorkerUpdate({
          hasController: Boolean(navigator.serviceWorker.controller),
          hasWaitingWorker: Boolean(reg.waiting) || installing.state === "installed",
          installingState: installing.state,
          dismissed: isUpdateDismissed(),
        })
      ) {
        setUpdateReady(true);
      }
    });
  });
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
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        watchRegistration(reg);
      })
      .catch(() => undefined);
  });
}

export function onServiceWorkerUpdateReady(fn: (ready: boolean) => void) {
  updateListeners.add(fn);
  fn(updateReady);
  return () => {
    updateListeners.delete(fn);
  };
}

export function dismissServiceWorkerUpdate() {
  try {
    sessionStorage.setItem(PWA_UPDATE_DISMISS_KEY, "1");
  } catch {
    // Private mode can block sessionStorage.  Still hide for this page.
  }
  setUpdateReady(false);
}

export async function applyServiceWorkerUpdate() {
  const reg = await navigator.serviceWorker.getRegistration();
  const waiting = reg?.waiting;
  if (waiting) {
    waiting.postMessage({ type: "SKIP_WAITING" });
  }
  window.location.reload();
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
