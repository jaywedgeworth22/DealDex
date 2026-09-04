# 2026-09-01 — DealDex Sentry fleet adoption (Grok, `grok/sentry-fleet-adoption`)

## Summary

Production was dark: `@sentry/react` ^10.73 already had Replay + `enableLogs`, gated on `VITE_SENTRY_DSN`, but Vercel production did not bake the env so Vite inlined nothing.

- **Replay** stays 100% on error, 10% session, `maskAllText` / `blockAllMedia`.  DealDex is not the giant public congress.trade surface.  Reserved Replay quota is org-level (parent).
- **User Feedback** widget via `Sentry.feedbackIntegration` (light theme, auto-injected).
- **Vercel** `VITE_SENTRY_DSN` set on production + preview for the existing `dealdex` project.  No second Vercel project.
- **iOS Cocoa** no longer has a hardcoded DSN fallback.  `SENTRY_DSN` is Info.plist / XcodeGen `project.yml` only.
- **Android:** Owner un-deferred; see `docs/rollouts/2026-09-01-android-sentry-sdk.md`.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
