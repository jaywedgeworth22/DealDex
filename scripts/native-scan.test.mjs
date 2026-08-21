import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
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
  assert.match(oauth, /grok-google/);
});

test("iOS scan talks to the website without requiring a token", () => {
  const market = read("native/ios/DealDex/Market.swift");
  assert.match(market, /\/api\/native\/scan/);
  assert.match(market, /scanViaSite/);
  assert.match(market, /Scan never requires sign-in/);
  const settings = read("native/ios/DealDex/SettingsView.swift");
  assert.match(settings, /Sign in with Google/);
  const scanView = read("native/ios/DealDex/ScanView.swift");
  const marks = read("native/ios/DealDex/MarketplaceMarks.swift");
  assert.match(scanView, /MarketplaceToggle/);
  assert.match(scanView, /desk\.sources\.contains\("ebay"\)/);
  assert.match(scanView, /count: desk\.ebayCount/);
  assert.match(scanView, /count: desk\.mercariCount/);
  assert.match(scanView, /DealDexCopy\.subtitle/);
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
