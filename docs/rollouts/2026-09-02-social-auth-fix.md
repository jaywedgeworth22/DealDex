# 2026-09-02 — Social Auth UX Fix + Apple Sign In JWT Generation

**Branch:** `ag/fix-social-auth-flow`  **PR:** [#254](https://github.com/jaywedgeworth22/DealDex/pull/254)  **Merge SHA:** `8e9fe0a`  **Agent:** Antigravity

---

## What changed

### 1. Login page auto-dismisses after sign-in (`src/routes/login.tsx`)

The `/login` page previously had no awareness of session state.  After a Google or X OAuth
round-trip the browser redirects to `callbackURL` (defaults to `/settings`), but if the SPA
re-hydrated on `/login` the login card would sit open even with an active session.

**Fix:** Added `useCurrentUserState()` + `useEffect` that watches `{ user, isPending }`.
As soon as the session resolves to a signed-in user, the component calls
`navigate({ to: callbackURL })` — the login card closes itself automatically.

### 2. Apple Sign In — JWT auto-generation from raw key components (`src/lib/auth/social.ts`)

Apple's OAuth `client_secret` is a short-lived ES256 JWT signed with your `.p8` private key.
The old code accepted `APPLE_CLIENT_SECRET` as a pre-generated JWT that expired silently.

**Fix:** `social.ts` supports two env-var paths:

| Path | Env vars | Notes |
|---|---|---|
| **New (recommended)** | `APPLE_CLIENT_ID` + `APPLE_TEAM_ID` + `APPLE_KEY_ID` + `APPLE_PRIVATE_KEY` | JWT generated fresh every server start via `jose` |
| **Old (backward-compat)** | `APPLE_CLIENT_ID` + `APPLE_CLIENT_SECRET` | Pre-generated JWT used as-is |

`APPLE_PRIVATE_KEY` accepts both literal newlines and `\n`-escaped strings.

`server.ts`: `socialProviderConfig()` is now async; resolved via top-level await before `betterAuth()`.

---

## Env vars for Apple Sign In (Vercel)

```
APPLE_CLIENT_ID      com.your.services-id
APPLE_TEAM_ID        XXXXXXXXXX
APPLE_KEY_ID         XXXXXXXXXX
APPLE_PRIVATE_KEY    -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

Apple Services ID callback URL in Apple Developer Console must include:
- `https://dealdex.net/api/auth/callback/apple`

---

## Verification

- typecheck: 0 errors  |  lint: 0 errors  |  npm test: 197/197  |  CI verify: pass
