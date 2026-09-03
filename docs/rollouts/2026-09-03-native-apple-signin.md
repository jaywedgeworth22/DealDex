# 2026-09-03 — Native Apple Sign In (AG cap pickup)

Seat: GROK, continuing AG branch `ag/fix-apple-native-form-post` in `~/apps/dealdex-ag-apple-fix`.  PR #271.

## Why

Better Auth Apple OAuth uses `response_mode=form_post`.  The native `/api/native/oauth` route only handled GET, so iOS Apple sign-in failed silently.  AG replaced that with `ASAuthorizationAppleIDProvider` and a POST `/api/native/apple-signin` identity-token exchange, then hit a usage cap with verify red.

## What landed

- iOS `NativeAuth.signInApple()` shows the system Sign In with Apple sheet and POSTs `identityToken` plus optional `firstName`/`lastName`/`email`.
- Server route `/api/native/apple-signin` verifies the JWT via Better Auth `signInSocial` + `idToken`.  Better Auth expects `user.name` as `{ firstName, lastName }`, not a string.  AG left that payload fix uncommitted; GROK adopted it.
- `src/routeTree.gen.ts` now registers `/api/native/apple-signin`.  CI typecheck failed without that entry.
- Session token returns over HTTPS JSON.  The `dealdex://` custom-scheme query still carries only a PKCE code for Google/X.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Focused: `node --experimental-strip-types --import ./scripts/register-ts-alias.mjs --test scripts/native-scan.test.mjs`.

## Follow-ups

- iOS TestFlight ship of this binary is a later lane (ios-ship on merge of native/ios).
- Android Apple Sign In is not in this PR.
