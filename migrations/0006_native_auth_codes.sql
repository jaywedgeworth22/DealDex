-- One-time codes for the native sign-in handoff (PKCE-style).
--
-- The old flow redirected the raw Better Auth session token into
-- `dealdex://auth?token=...`. Custom URL schemes are not exclusive on Android:
-- any installed app may register the same filter and receive that redirect, and
-- the session token is a full-account bearer credential, so interception was
-- account takeover.
--
-- Now the redirect carries only a single-use CODE. Exchanging it for the token
-- requires the verifier, which is generated on the device and never leaves it,
-- so an app that hijacks the scheme gets something it cannot use.
create table if not exists native_auth_codes (
  code text primary key,
  -- base64url(sha256(verifier)) supplied when the flow started.
  challenge text not null,
  token text not null,
  email text not null default '',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists native_auth_codes_expires_idx on native_auth_codes (expires_at);
