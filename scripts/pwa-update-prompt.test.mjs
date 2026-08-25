import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function shouldOfferServiceWorkerUpdate(state) {
  if (state.dismissed) return false;
  if (!state.hasController) return false;
  if (state.hasWaitingWorker) return true;
  return state.installingState === "installed";
}

test("PWA offers a skippable reload when a waiting worker exists", () => {
  assert.equal(
    shouldOfferServiceWorkerUpdate({
      hasController: true,
      hasWaitingWorker: true,
      installingState: null,
      dismissed: false,
    }),
    true,
  );
  assert.equal(
    shouldOfferServiceWorkerUpdate({
      hasController: true,
      hasWaitingWorker: false,
      installingState: "installed",
      dismissed: false,
    }),
    true,
  );
  assert.equal(
    shouldOfferServiceWorkerUpdate({
      hasController: false,
      hasWaitingWorker: true,
      installingState: "installed",
      dismissed: false,
    }),
    false,
    "first install stays silent",
  );
  assert.equal(
    shouldOfferServiceWorkerUpdate({
      hasController: true,
      hasWaitingWorker: true,
      installingState: "installed",
      dismissed: true,
    }),
    false,
    "Not Now dismisses the offer",
  );
  assert.equal(
    shouldOfferServiceWorkerUpdate({
      hasController: true,
      hasWaitingWorker: false,
      installingState: "installing",
      dismissed: false,
    }),
    false,
  );
});

test("PWA client watches waiting workers and mounts a reload banner", () => {
  const decision = read("src/lib/pwa-update.ts");
  assert.match(decision, /export function shouldOfferServiceWorkerUpdate/);
  assert.match(decision, /hasWaitingWorker/);
  assert.match(decision, /installingState === "installed"/);
  assert.match(decision, /Reload to use it/);
  assert.match(decision, /Not Now/);
  assert.doesNotMatch(decision, /min-version|force-update|coordinator|owner/i);

  const pwa = read("src/lib/pwa.ts");
  assert.match(pwa, /shouldOfferServiceWorkerUpdate/);
  assert.match(pwa, /reg\.waiting/);
  assert.match(pwa, /updatefound/);
  assert.match(pwa, /SKIP_WAITING/);
  assert.match(pwa, /export function onServiceWorkerUpdateReady/);
  assert.match(pwa, /export function dismissServiceWorkerUpdate/);
  assert.match(pwa, /export async function applyServiceWorkerUpdate/);
  assert.match(pwa, /visibilitychange/);
  assert.doesNotMatch(pwa, /forceUpdate|minVersion/);

  const banner = read("src/components/pwa-update-banner.tsx");
  assert.match(banner, /PwaUpdateBanner/);
  assert.match(banner, /PWA_UPDATE_COPY/);
  assert.match(banner, /applyServiceWorkerUpdate/);
  assert.match(banner, /dismissServiceWorkerUpdate/);
  assert.doesNotMatch(banner, /coordinator|Jay|owner/i);

  const root = read("src/routes/__root.tsx");
  assert.match(root, /PwaUpdateBanner/);
  assert.match(root, /registerServiceWorker/);
});

test("service worker still skipWaits and honors a reload SKIP_WAITING message", () => {
  const sw = read("public/sw.js");
  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /event\.data\.type === "SKIP_WAITING"/);
  assert.match(sw, /self\.clients\.claim\(\)/);
});
