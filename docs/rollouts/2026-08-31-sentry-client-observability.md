# 2026-08-31 — Sentry client observability: Session Replay, error capture & distributed tracing (Antigravity, `ag/sentry-observability-expansion`)

## Summary
Integrated Sentry client observability into DealDex (`jays-services/dealdex`):
- **@sentry/react client integration**: Initialized in `src/routes/__root.tsx` via `src/lib/observability/sentry.ts`.
- **Session Replay enabled**: 100% capture on errors (`replaysOnErrorSampleRate: 1.0`) and 10% baseline session sampling (`replaysSessionSampleRate: 0.1`) with full privacy masking (`maskAllText: true`, `blockAllMedia: true`).
- **Distributed tracing**: Browser tracing enabled with baseline 0.2 sample rate.
- **Inert when unconfigured**: Completely inert in dev/CI when `VITE_SENTRY_DSN` is not provided.

## Verification
- `npm run typecheck` — 0 errors.
- `npm test` — 197/197 tests passed.
