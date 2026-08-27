-- Server-issued state for the native sign-in handoff.
--
-- 0006 bound the redeem code to a PKCE challenge, but nothing bound the
-- CHALLENGE to a flow this server started: the `done=1` leg read `challenge`
-- straight off the query string and validated only its shape. Because the
-- session cookie is SameSite=Lax it rides along on a top-level GET navigation,
-- so a malicious app could simply open
--
--   https://dealdex.net/api/native/oauth?done=1&challenge=<its own>
--
-- receive `dealdex://auth?code=…` on the scheme filter it registered, and redeem
-- that code with the verifier it chose. PKCE bought nothing.
--
-- Now leg 1 mints a random `state`, stores it against the challenge here, and
-- puts ONLY the state in the OAuth callbackURL. Leg 2 looks the challenge up by
-- state and deletes the row, so a challenge the server never issued cannot be
-- presented at the return leg.
create table if not exists native_auth_pending (
  state text primary key,
  challenge text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists native_auth_pending_expires_idx on native_auth_pending (expires_at);
