/**
 * Sentry client observability for DealDex.
 *
 * Gated on VITE_SENTRY_DSN (inlined by Vite at build time).
 * Completely inert in dev/CI when no DSN is provided.
 *
 * Replay stays 100% on error / 10% session.  DealDex is not the giant
 * public congress.trade surface; reserved Replay quota is org-level.
 * User Feedback is the consumer widget (auto-injected).  Privacy: mask
 * all text and block all media on Replay.
 */

import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry(): void {
  if (initialized || typeof window === "undefined") return;

  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim();
  if (!dsn) return;

  const env = (import.meta.env.VITE_SENTRY_ENV as string | undefined)?.trim() ||
    (import.meta.env.MODE as string | undefined) ||
    "production";

  const tracesSampleRate = Number(
    (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined)?.trim() ?? "0.2"
  );
  const replayRaw = (import.meta.env.VITE_SENTRY_REPLAY_ENABLED as string | undefined)?.trim();
  const replayDisabled = replayRaw ? /^(false|0|off|no)$/i.test(replayRaw) : false;
  const replaysSessionSampleRate = Number(
    (import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE as string | undefined)?.trim() ?? "0.1"
  );
  const replaysOnErrorSampleRate = Number(
    (import.meta.env.VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE as string | undefined)?.trim() ?? "1.0"
  );

  Sentry.init({
    dsn,
    environment: env,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? Math.min(Math.max(tracesSampleRate, 0), 1) : 0.2,
    enableLogs: true,
    replaysSessionSampleRate: !replayDisabled && Number.isFinite(replaysSessionSampleRate) ? replaysSessionSampleRate : 0,
    replaysOnErrorSampleRate: !replayDisabled && Number.isFinite(replaysOnErrorSampleRate) ? replaysOnErrorSampleRate : 0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: "light",
        autoInject: true,
        showBranding: false,
        buttonLabel: "Report a problem",
        submitButtonLabel: "Send",
        formTitle: "Report a problem",
      }),
      ...(!replayDisabled
        ? [
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ]
        : []),
    ],
  });

  initialized = true;
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
