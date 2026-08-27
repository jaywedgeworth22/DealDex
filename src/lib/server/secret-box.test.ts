import assert from "node:assert/strict";
import { test } from "node:test";

// Fixed before the module is imported: the key is derived from this once.
process.env.BETTER_AUTH_SECRET = "deterministic-secret-for-tests";
const { decryptSecret, encryptSecret } = await import("./secret-box");

test("a desk key survives a round trip", () => {
  const plain = "tcg_live_abc123-XYZ_/+=";
  assert.equal(decryptSecret(encryptSecret(plain)), plain);
});

test("ciphertext is versioned and does not contain the plaintext", () => {
  const ct = encryptSecret("pricecharting-token-value");
  assert.match(ct, /^v1\./);
  assert.equal(ct.split(".").length, 4);
  assert.doesNotMatch(ct, /pricecharting-token-value/);
});

test("the same value encrypts differently every time", () => {
  // A reused IV under AES-GCM is catastrophic, so this is worth pinning.
  const a = encryptSecret("same-input");
  const b = encryptSecret("same-input");
  assert.notEqual(a, b);
  assert.equal(decryptSecret(a), "same-input");
  assert.equal(decryptSecret(b), "same-input");
});

test("legacy plaintext rows still read", () => {
  // desk_keys held bare text before this landed; those rows must keep working
  // and re-encrypt on the owner's next save rather than needing a migration.
  assert.equal(decryptSecret("plain-legacy-key"), "plain-legacy-key");
});

test("a tampered row degrades to empty instead of throwing", () => {
  const ct = encryptSecret("real-value");
  const tampered = `${ct.slice(0, -4)}AAAA`;
  assert.equal(decryptSecret(tampered), "");
  assert.equal(decryptSecret("v1.only.two"), "");
  assert.equal(decryptSecret("v1."), "");
});

test("empty in, empty out", () => {
  assert.equal(encryptSecret(""), "");
  assert.equal(decryptSecret(""), "");
  assert.equal(decryptSecret(null), "");
  assert.equal(decryptSecret(undefined), "");
});

test("unicode and long values survive", () => {
  const long = "k".repeat(200);
  assert.equal(decryptSecret(encryptSecret(long)), long);
  assert.equal(decryptSecret(encryptSecret("clé—é🔑")), "clé—é🔑");
});
