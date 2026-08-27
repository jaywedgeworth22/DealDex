import { getSql } from "@/lib/db";
import { challengeFor, constantTimeEquals } from "./native-auth-pkce";

/**
 * Single-use codes for the native sign-in handoff (server-only).
 *
 * See `migrations/0006_native_auth_codes.sql` for why this exists: the previous
 * flow put a live session token straight into a `dealdex://` redirect, which any
 * app on the device could claim.
 */

/** Short enough that a leaked code is stale before it is useful. */
const CODE_TTL_MS = 2 * 60 * 1000;

/**
 * How long a started sign-in may take. Generous, because it spans the whole
 * OAuth round trip including the provider's own consent screen.
 */
const PENDING_TTL_MS = 10 * 60 * 1000;

export type NativeSession = { token: string; email: string };

export {
  challengeFor,
  isValidChallenge,
  isValidVerifier,
  newCode,
} from "./native-auth-pkce";

/**
 * Remember a challenge against a server-issued `state` at the start of a flow.
 *
 * This is what makes the challenge trustworthy at the return leg. Without it the
 * `done=1` handler accepted any caller-supplied challenge and would mint a code
 * for it using the ambient session cookie — see `migrations/0007`.
 */
export async function storePendingAuth(state: string, challenge: string): Promise<void> {
  const sql = await getSql();
  await sweepPending(sql);
  await sql`
    insert into native_auth_pending (state, challenge, expires_at)
    values (${state}, ${challenge}, now() + ${`${PENDING_TTL_MS} milliseconds`}::interval)
  `;
}

/**
 * Consume a `state` and return the challenge it was issued with. Single use, so
 * a state cannot be replayed to mint a second code.
 */
export async function takePendingAuth(state: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ challenge: string; expired: boolean }>`
    delete from native_auth_pending
    where state = ${state}
    returning challenge, (expires_at <= now()) as expired
  `;
  const row = rows[0];
  if (!row || row.expired) return null;
  return row.challenge;
}

export async function storeCode(
  code: string,
  challenge: string,
  session: NativeSession,
): Promise<void> {
  const sql = await getSql();
  await sweep(sql);
  await sql`
    insert into native_auth_codes (code, challenge, token, email, expires_at)
    values (${code}, ${challenge}, ${session.token}, ${session.email}, now() + ${`${CODE_TTL_MS} milliseconds`}::interval)
  `;
}

/**
 * Redeem a code. Single use: the row is deleted whether or not the verifier
 * matches, so a wrong guess burns the code rather than allowing a retry loop.
 */
export async function redeemCode(code: string, verifier: string): Promise<NativeSession | null> {
  const sql = await getSql();
  const rows = await sql<{ challenge: string; token: string; email: string; expired: boolean }>`
    delete from native_auth_codes
    where code = ${code}
    returning challenge, token, email, (expires_at <= now()) as expired
  `;
  const row = rows[0];
  if (!row || row.expired) return null;
  if (!constantTimeEquals(challengeFor(verifier), row.challenge)) return null;
  return { token: row.token, email: row.email };
}

async function sweep(sql: Awaited<ReturnType<typeof getSql>>): Promise<void> {
  await sql`delete from native_auth_codes where expires_at <= now()`;
}

async function sweepPending(sql: Awaited<ReturnType<typeof getSql>>): Promise<void> {
  await sql`delete from native_auth_pending where expires_at <= now()`;
}
