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

export type NativeSession = { token: string; email: string };

export {
  challengeFor,
  isValidChallenge,
  isValidVerifier,
  newCode,
} from "./native-auth-pkce";

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
