import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("official DealDex wordmark PNG is present", () => {
  const png = readFileSync(join(ROOT, "public/marks/dealdex-wordmark.png"));
  assert.ok(png.length > 8);
  assert.equal(png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
});

test("dd.svg is the official title wordmark, not a DD monogram", () => {
  const svg = readFileSync(join(ROOT, "public/marks/dd.svg"), "utf8");
  assert.match(svg, /DealDex/);
  assert.match(svg, /#E30613/);
  assert.match(svg, /#0066FF/);
  assert.match(svg, /#FFD200/);
  assert.doesNotMatch(svg, />DD</);
});

test("header and login use DealDexWordmark, not a chip plus serif title", () => {
  const shell = readFileSync(join(ROOT, "src/components/shell.tsx"), "utf8");
  const login = readFileSync(join(ROOT, "src/routes/login.tsx"), "utf8");
  assert.match(shell, /DealDexWordmark/);
  assert.doesNotMatch(shell, /<AppMark/);
  assert.match(login, /DealDexWordmark/);
  assert.doesNotMatch(login, /<AppMark/);
});
