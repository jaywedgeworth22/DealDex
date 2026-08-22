import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("canonical public host is dealdex.net, not dealdex.online", () => {
  assert.match(read("src/routes/__root.tsx"), /VITE_PUBLIC_HOSTNAME \|\| "dealdex\.net"/);
  assert.match(read("native/ios/DealDex/NativeAuth.swift"), /https:\/\/dealdex\.net/);
  assert.match(read("docs/store-listing.md"), /https:\/\/dealdex\.net\/privacy/);
  assert.doesNotMatch(read("src/routes/__root.tsx"), /dealdex\.online/);
});
