import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The pure half of the native sign-in handoff — no database import, so it can be
 * unit tested directly. `native-auth-codes.ts` holds the storage half and
 * re-exports these.
 *
 * The encodings here have to agree with two clients that cannot be run in CI:
 * `NativeAuth.swift` (`Data.base64URLEncoded()`) and `NativeAuth.kt`
 * (`Base64.URL_SAFE or NO_PADDING or NO_WRAP`). Both produce unpadded base64url,
 * which is what `digest("base64url")` produces here. `native-auth-pkce.test.ts`
 * pins that so a change on this side is caught before it silently breaks
 * sign-in on a phone.
 */

/** base64url, so it survives a URL round trip without escaping. */
export function newCode(): string {
  return randomBytes(32).toString("base64url");
}

export function challengeFor(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/** Shape check only — the value is opaque to us. */
export function isValidChallenge(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{20,128}$/.test(value);
}

/**
 * A verifier is only useful if it carries real entropy. 32 random bytes is 43
 * base64url characters; anything much shorter is not a PKCE verifier.
 */
export function isValidVerifier(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_.~-]{32,128}$/.test(value);
}

export function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
