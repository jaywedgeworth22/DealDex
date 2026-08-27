import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  challengeFor,
  constantTimeEquals,
  isValidChallenge,
  isValidVerifier,
  newCode,
} from "./native-auth-pkce";

test("the challenge is unpadded base64url(sha256(verifier))", () => {
  // This is the contract the iOS and Android clients implement independently —
  // Swift replaces +/= by hand, Kotlin uses URL_SAFE|NO_PADDING|NO_WRAP. Neither
  // can be run in CI, so pin the exact bytes here.
  const verifier = "dGVzdC12ZXJpZmllci0zMi1ieXRlcy1sb25nLWVub3VnaA";
  const expected = createHash("sha256").update(verifier).digest("base64url");
  assert.equal(challengeFor(verifier), expected);
  assert.equal(challengeFor(verifier), "yfkogxE9LD2M-aV2XEsuDm1WMrZv5PU8Og5GUy-AFso");
});

test("nothing we emit needs URL escaping", () => {
  for (let i = 0; i < 20; i += 1) {
    const code = newCode();
    assert.doesNotMatch(code, /[+/=]/, `code must be url-safe: ${code}`);
    assert.equal(code.length, 43);
    assert.doesNotMatch(challengeFor(code), /[+/=]/);
  }
});

test("codes do not repeat", () => {
  const seen = new Set(Array.from({ length: 200 }, () => newCode()));
  assert.equal(seen.size, 200);
});

test("a challenge must look like a challenge", () => {
  assert.equal(isValidChallenge(challengeFor("anything")), true);
  assert.equal(isValidChallenge(""), false);
  assert.equal(isValidChallenge(null), false);
  assert.equal(isValidChallenge("tooshort"), false);
  // Padded / non-url-safe base64 is rejected, which catches a client that
  // forgot to strip `=` or swap `+/`.
  assert.equal(isValidChallenge("abcdefghijklmnopqrstuvwx+/=="), false);
  assert.equal(isValidChallenge("a".repeat(200)), false);
});

test("a verifier must carry real entropy", () => {
  assert.equal(isValidVerifier(newCode()), true);
  assert.equal(isValidVerifier("short"), false);
  assert.equal(isValidVerifier(""), false);
  assert.equal(isValidVerifier(null), false);
});

test("challenge comparison is length-safe and exact", () => {
  const a = challengeFor("one");
  const b = challengeFor("two");
  assert.equal(constantTimeEquals(a, a), true);
  assert.equal(constantTimeEquals(a, b), false);
  // Different lengths must not throw — timingSafeEqual does if lengths differ.
  assert.equal(constantTimeEquals(a, a.slice(0, 10)), false);
  assert.equal(constantTimeEquals("", ""), true);
});

test("a wrong verifier never produces the right challenge", () => {
  const real = "verifier-that-the-app-generated-and-kept";
  const guess = "verifier-that-the-app-generated-and-kepu";
  assert.notEqual(challengeFor(real), challengeFor(guess));
});
