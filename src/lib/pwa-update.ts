export type ServiceWorkerUpdateState = {
  hasController: boolean;
  hasWaitingWorker: boolean;
  installingState?: string | null;
  dismissed: boolean;
};

export const PWA_UPDATE_COPY = {
  title: "Update available",
  body: "A newer version of DealDex is ready.  Reload to use it.",
  reload: "Reload",
  notNow: "Not Now",
} as const;

export function shouldOfferServiceWorkerUpdate(state: ServiceWorkerUpdateState): boolean {
  if (state.dismissed) return false;
  if (!state.hasController) return false;
  if (state.hasWaitingWorker) return true;
  return state.installingState === "installed";
}
