import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("root layout mounts Vercel Analytics via the React import, not Next.js", () => {
  const root = read("src/routes/__root.tsx");
  assert.match(root, /from "@vercel\/analytics\/react"/);
  assert.match(root, /<Analytics \/>/);
  assert.doesNotMatch(root, /@vercel\/analytics\/next/);
});

test("service worker does not intercept Vercel insight requests", () => {
  const sw = read("public/sw.js");
  assert.match(sw, /pathname\.startsWith\("\/_vercel\/"\)/);
});

test("privacy page discloses website analytics", () => {
  const privacy = read("src/routes/privacy.tsx");
  assert.match(privacy, /Vercel Web Analytics/);
  assert.match(privacy, /does not use cookies/);
});
