import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUBTITLE = "Identify Best-Priced Pokémon Card Listings";

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("shared subtitle constant matches the owner string", () => {
  const copy = read("src/lib/copy.ts");
  assert.match(copy, new RegExp(SUBTITLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("site, OG, and apps use the new subtitle", () => {
  assert.match(read("src/routes/index.tsx"), /APP_SUBTITLE/);
  assert.match(read("src/routes/__root.tsx"), /APP_SUBTITLE/);
  assert.match(read("scripts/og-dealdex.html"), new RegExp(SUBTITLE.replace("é", "é")));
  assert.match(read("native/android/app/src/main/res/values/strings.xml"), new RegExp(SUBTITLE));
  assert.doesNotMatch(read("src/routes/index.tsx"), /Find the best listings/);
  assert.doesNotMatch(read("src/routes/__root.tsx"), /Find the best listings/);
});

test("scan box has no suggested Pokémon chips and one marketplace toggle pair", () => {
  const scan = read("src/components/scanner.tsx");
  assert.doesNotMatch(scan, /charizard/);
  assert.doesNotMatch(scan, /umbreon/);
  assert.doesNotMatch(scan, /CHIPS/);
  assert.match(scan, /size="lg"/);
  assert.match(scan, /count=\{ebayCount\}/);
  assert.match(scan, /count=\{mercariCount\}/);
  assert.match(scan, /md:grid-cols-2/);
  assert.match(scan, /grid-cols-3/);
  assert.match(scan, /bg-scan/);
  assert.equal((scan.match(/MarketplaceToggle/g) || []).length, 3);
});

test("OG wordmark is sized to about 70% of the 1200px card", () => {
  const og = read("scripts/og-dealdex.html");
  assert.match(og, /width:\s*840px/);
  assert.match(og, /max-width:\s*75%/);
});

test("Android scan has no suggested chips and shows counts on source toggles", () => {
  const kt = read("native/android/app/src/main/java/me/grok/dealdex/ui/ScanScreen.kt");
  assert.doesNotMatch(kt, /charizard/);
  assert.doesNotMatch(kt, /POKÉMON LISTING DESK/);
  assert.match(kt, /MarketplaceSourceToggle/);
  assert.match(kt, /GridCells\.Fixed/);
});
