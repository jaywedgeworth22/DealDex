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

test("vercel.json does not 308 dealdex.online while dealdex.net is not the app", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const redirects = vercel.redirects ?? [];
  for (const rule of redirects) {
    const hosts = (rule.has ?? [])
      .filter((h) => h.type === "host")
      .map((h) => h.value);
    const sendsOnlineAway =
      hosts.includes("dealdex.online") || hosts.includes("www.dealdex.online");
    assert.equal(
      sendsOnlineAway,
      false,
      "do not redirect dealdex.online until dealdex.net is on the Vercel project and TLS is green",
    );
  }
});
