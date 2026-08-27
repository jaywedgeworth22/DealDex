import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

/**
 * Source with comments removed.
 *
 * Needed because these files deliberately DESCRIBE the attacks they defend
 * against, and a doc comment quoting `?done=1&challenge=` would otherwise trip
 * an assertion that the code never builds such a URL.
 */
function readCode(rel) {
  return read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

test("native scan payload maps adjustedMarket to adjusted for the iPhone parser", () => {
  const src = read("src/lib/native/scan-payload.ts");
  assert.match(src, /export function nativeScanRows/);
  assert.match(src, /adjusted: row\.appraisal\.adjustedMarket/);
  assert.match(src, /grade: row\.parsed\.grade/);
  assert.match(src, /marketplace: row\.listing\.marketplace/);
});

test("native scan and oauth routes exist and are public (no session gate on scan)", () => {
  const scan = read("src/routes/api/native/scan.ts");
  assert.match(scan, /createFileRoute\("\/api\/native\/scan"\)/);
  assert.match(scan, /scanAndScore/);
  assert.doesNotMatch(scan, /getSessionUser/);
  const oauth = read("src/routes/api/native/oauth.ts");
  assert.match(oauth, /createFileRoute\("\/api\/native\/oauth"\)/);
  assert.match(oauth, /NATIVE_SCHEME = "dealdex"/);
  assert.match(oauth, /:\/\/auth\?/);
  assert.match(oauth, /signInSocial/);
  assert.match(oauth, /"google"/);
});

test("the native scan endpoint refuses desk keys, because /privacy promises it", () => {
  const scan = read("src/routes/api/native/scan.ts");
  // No key plumbing at all: no reader, no type, no pass-through to the scorer.
  assert.doesNotMatch(scan, /cleanKeys/);
  assert.doesNotMatch(scan, /DeskKeys/);
  assert.doesNotMatch(scan, /body\.keys/);
  assert.match(scan, /scanAndScore\(query, sources\)/);

  const privacy = read("src/routes/privacy.tsx");
  assert.match(privacy, /never send a key to a DealDex server/);
});

test("native sign-in hands over a single-use code, never a session token", () => {
  const oauth = read("src/routes/api/native/oauth.ts");
  // The hand-off must carry `code`, and must NOT carry the session token.
  assert.match(oauth, /handoffPage\(code, email\)/);
  assert.doesNotMatch(oauth, /nativeRedirect\(\{ token/);
  assert.match(oauth, /isValidChallenge/);

  const exchange = read("src/routes/api/native/exchange.ts");
  assert.match(exchange, /createFileRoute\("\/api\/native\/exchange"\)/);
  assert.match(exchange, /redeemCode/);

  // Both clients must send a challenge and redeem with a verifier.
  const swift = read("native/ios/DealDex/NativeAuth.swift");
  assert.match(swift, /challenge=/);
  assert.match(swift, /api\/native\/exchange/);
  assert.doesNotMatch(swift, /dict\["token"\]/);

  const kotlin = read("native/android/app/src/main/java/me/grok/dealdex/data/NativeAuth.kt");
  assert.match(kotlin, /appendQueryParameter\("challenge"/);
  assert.match(kotlin, /api\/native\/exchange/);
  assert.doesNotMatch(kotlin, /getQueryParameter\("token"\)/);
});

test("the return leg trusts a server-issued state, never a caller's challenge", () => {
  // Without this, a malicious app could open
  //   /api/native/oauth?done=1&challenge=<its own>
  // as a top-level navigation, ride the SameSite=Lax session cookie, catch
  // dealdex://auth?code=… on its own intent filter, and redeem the code with the
  // verifier it picked. PKCE would have bought nothing.
  const oauth = readCode("src/routes/api/native/oauth.ts");
  const doneLeg = oauth.slice(oauth.indexOf('get("done")'), oauth.indexOf("const providerId"));
  assert.doesNotMatch(
    doneLeg,
    /searchParams\.get\("challenge"\)/,
    "the done=1 leg must never read a challenge from the query string",
  );
  assert.match(doneLeg, /takePendingAuth\(state\)/);
  assert.match(doneLeg, /sign_in_expired/);

  // Leg 1 must mint and persist the state, and send only the state onward.
  assert.match(oauth, /storePendingAuth\(state, challenge\)/);
  assert.match(oauth, /done=1&state=\$\{encodeURIComponent\(state\)\}/);
  assert.doesNotMatch(oauth, /done=1&challenge=/);
});

test("the hand-off needs a tap, so a flow the user did not start cannot finish silently", () => {
  const oauth = read("src/routes/api/native/oauth.ts");
  assert.match(oauth, /function handoffPage/);
  assert.match(oauth, /text\/html/);
  assert.match(oauth, /escapeHtml\(target\)/);
  assert.match(oauth, /If you did not start this sign-in/);
});

test("credentials are kept in the platform keystore, not a plain prefs file", () => {
  const prefs = read("native/android/app/src/main/java/me/grok/dealdex/data/Prefs.kt");
  assert.match(prefs, /EncryptedSharedPreferences/);
  const manifest = read("native/android/app/src/main/AndroidManifest.xml");
  assert.match(manifest, /android:allowBackup="false"/);

  const store = read("native/ios/DealDex/DeskStore.swift");
  assert.match(store, /kSecClassGenericPassword/);
  assert.match(store, /kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly/);
});

test("the iOS card scanner is gone until it actually uses the camera", () => {
  // It reported "Charizard 4/102" after a 1.2s timer with no AVCaptureSession.
  const scanView = read("native/ios/DealDex/ScanView.swift");
  assert.doesNotMatch(scanView, /CameraScannerView/);
  const pbx = read("native/ios/DealDex.xcodeproj/project.pbxproj");
  assert.doesNotMatch(pbx, /CameraScannerView/);
});

test("Android scans on the device first and sends no keys to the website", () => {
  const market = read("native/android/app/src/main/java/me/grok/dealdex/data/Market.kt");
  assert.match(market, /\/api\/native\/scan/);
  assert.match(market, /scanViaSite/);
  // On-device is the primary path, which is what /privacy describes.
  assert.match(market, /scanOnDevice\(query, keys, sources\)[\s\S]{0,400}scanViaSite\(site, query, sources\)/);
  // The site payload carries no credential of any kind.
  assert.doesNotMatch(market, /put\("keys"/);
  assert.doesNotMatch(market, /"justtcg", keys\.justTcg/);
  const scan = read("native/android/app/src/main/java/me/grok/dealdex/ui/ScanScreen.kt");
  assert.match(scan, /Text\("SCAN"/);
  assert.match(scan, /Hide proxies/);
  assert.match(scan, /leave blank to scan everything/);
  assert.doesNotMatch(scan, /Text\("Scan"\)/);
});

test("iOS scans on the device first and sends no keys to the website", () => {
  const market = read("native/ios/DealDex/Market.swift");
  assert.match(market, /\/api\/native\/scan/);
  assert.match(market, /scanViaSite/);
  assert.match(market, /scanOnDevice\(query, keys: keys, sources: src\)[\s\S]{0,400}scanViaSite\(site, query, sources: src\)/);
  assert.doesNotMatch(market, /"keys": \[/);
  assert.doesNotMatch(market, /"justtcg": keys\.justTcg/);
  const settings = read("native/ios/DealDex/SettingsView.swift");
  assert.match(settings, /Sign in with Google/);
  assert.match(settings, /Sign in with Apple/);
  assert.match(settings, /Sign in with X/);
  assert.doesNotMatch(settings, /Sign In with email/);
  assert.doesNotMatch(settings, /Create Account/);
  const scanView = read("native/ios/DealDex/ScanView.swift");
  const marks = read("native/ios/DealDex/MarketplaceMarks.swift");
  assert.match(scanView, /MarketplaceToggle/);
  assert.match(scanView, /desk\.sources\.contains\("ebay"\)/);
  assert.match(scanView, /count: desk\.ebayCount/);
  assert.match(scanView, /count: desk\.mercariCount/);
  assert.match(scanView, /DealDexCopy\.subtitle/);
  assert.match(scanView, /ProgressView\("Reading eBay and Mercari…"\)/);
  assert.match(
    scanView,
    /ProgressView\("Reading eBay and Mercari…"\)\s*\.frame\(maxWidth: \.infinity, maxHeight: \.infinity, alignment: \.center\)/,
  );
  assert.doesNotMatch(scanView, /charizard/);
  assert.doesNotMatch(scanView, /POKÉMON LISTING DESK/);
  assert.match(marks, /EbayWordmark/);
  assert.match(marks, /MercariWordmark/);
  assert.match(marks, /eoFill: true/);
  assert.match(marks, /width: 35 \* scale, height: 14 \* scale/);
  assert.match(marks, /width: 64 \* scale, height: 14 \* scale/);
  assert.doesNotMatch(scanView, /Text\("e"\)/);
  assert.doesNotMatch(scanView, /Text\("MERCARI"\)/);
});
