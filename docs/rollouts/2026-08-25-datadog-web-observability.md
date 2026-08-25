# 2026-08-25 — Datadog logs + APM + RUM on DealDex web

## Why

DealDex had no Datadog instrumentation.  The fleet already has a Datadog
account on US5 (`us5.datadoghq.com`) with host/APM traffic from other apps.
This seat adds website logs, agentless APM, and browser RUM against that
account.  No new Datadog org.  No Vercel log/trace drains (those are billed
by Vercel).  Sentry and PagerDuty are unchanged.

## What

- Resolve existing env names only: `DD_API_KEY` / `DATADOG_API_KEY`,
  `DD_SITE`, `DD_SERVICE`, `DD_ENV`, `DD_VERSION`, `DD_APPLICATION_ID`,
  `DD_CLIENT_TOKEN` (plus the `VITE_DD_*` aliases Vite can see).
- Production (`VERCEL_ENV=production`) is fail-closed when those keys are
  missing.  Preview, CI, and local skip instrumentation.
- Nitro middleware ships JSON logs to HTTP log intake and one server span
  per request to OTLP HTTP intake.  Application errors are rethrown.
- Browser `@datadog/browser-rum-slim` + `@datadog/browser-logs`.  Slim has
  no Session Replay worker.  Replay sample rate stays 0.
- Privacy page discloses Datadog.  iOS is unchanged: no supported RUM SDK
  is in the Xcode project, and this seat does not add a local Mac
  `xcodebuild` or `--force-ship`.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Do not deploy from this seat.  After merge, Vercel Production on
`dealdex.net` needs the existing Datadog env vars on project `dealdex`.
Create a Browser RUM application named DealDex in the existing US5 org if
`DD_APPLICATION_ID` / `DD_CLIENT_TOKEN` are not already set.
