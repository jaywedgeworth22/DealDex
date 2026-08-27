import { getRequest } from "@tanstack/react-start/server";

/**
 * Fixed-window rate limiting for the endpoints that are deliberately public.
 *
 * Scope and honesty about it: this is an IN-PROCESS counter. On Vercel each warm
 * instance keeps its own map, so the effective ceiling is `limit x instances`,
 * not `limit`. That is a mitigation against a single abusive client hammering
 * one instance — it is NOT a global quota. Anything that needs a hard global
 * limit belongs in Postgres or an edge KV; this exists so `/api/native/scan`,
 * which fans out to eight third-party services per call and writes a database
 * row, cannot be driven flat out by an unauthenticated caller for free.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Hard ceiling on tracked keys, so the limiter cannot itself become the leak. */
const MAX_KEYS = 5_000;

export type RateLimitResult = { ok: boolean; retryAfterMs: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) evictExpired(now);
    buckets.delete(key);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) return { ok: false, retryAfterMs: hit.resetAt - now };
  return { ok: true, retryAfterMs: 0 };
}

function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still full of live buckets: drop the oldest insertions (Map preserves order)
  // rather than growing without bound.
  while (buckets.size >= MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

/**
 * Best-effort caller identity. `x-forwarded-for`'s first hop is what Vercel puts
 * the real client IP in; it is spoofable in general but not behind Vercel's
 * proxy, which rewrites it.
 */
export function clientKey(request: Request | null | undefined, scope: string): string {
  const headers = request?.headers;
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = forwarded || headers?.get("x-real-ip") || headers?.get("cf-connecting-ip") || "anon";
  return `${scope}:${real}`;
}

/** `clientKey` for a server function, which reads the ambient request. */
export function serverFnClientKey(scope: string): string {
  try {
    return clientKey(getRequest(), scope);
  } catch {
    return `${scope}:anon`;
  }
}

export class RateLimitedError extends Error {
  readonly status = 429;
  constructor(readonly retryAfterMs: number) {
    super("Too many scans from this connection. Give it a minute.");
    this.name = "RateLimitedError";
  }
}
