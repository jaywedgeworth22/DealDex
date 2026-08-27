import type { DatadogLogStatus, ServerObservabilityConfig } from "./config";
import { logStatusRank, shouldSampleRoutine } from "./config";
import type { TraceContext } from "./ids";

type LogPayload = {
  status: DatadogLogStatus;
  message: string;
  resource?: string;
  durationMs?: number;
  httpStatus?: number;
  error?: unknown;
  extra?: Record<string, string | number | boolean | undefined>;
};

type SpanPayload = {
  ctx: TraceContext;
  name: string;
  resource: string;
  startNs: bigint;
  endNs: bigint;
  httpMethod: string;
  httpStatus: number;
  error: boolean;
  errorMessage?: string;
};

function siteHost(site: string): string {
  return site.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function logsIntakeUrl(site: string): string {
  return `https://http-intake.logs.${siteHost(site)}/api/v2/logs`;
}

function tracesIntakeUrl(site: string): string {
  return `https://otlp.${siteHost(site)}/v1/traces`;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function errorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

function attr(key: string, value: string | number | boolean) {
  if (typeof value === "number") {
    return { key, value: Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value } };
  }
  if (typeof value === "boolean") {
    return { key, value: { boolValue: value } };
  }
  return { key, value: { stringValue: value } };
}

/**
 * Ship one JSON log to the existing Datadog HTTP intake.
 * Intake failures are printed, not swallowed as success, and never hide the
 * original application error (the caller still rethrows).
 */
export async function shipDatadogLog(
  config: ServerObservabilityConfig,
  payload: LogPayload,
): Promise<void> {
  if (payload.status === "info" && !shouldSampleRoutine(config.env)) return;
  if (payload.status === "debug") return;

  const body = [
    {
      ddsource: "nodejs",
      ddtags: `env:${config.env},version:${config.version}`,
      service: config.service,
      hostname: "vercel",
      status: payload.status,
      message: payload.message,
      resource: payload.resource,
      duration_ms: payload.durationMs,
      http: payload.httpStatus === undefined ? undefined : { status_code: payload.httpStatus },
      error:
        payload.error === undefined
          ? undefined
          : { message: errorText(payload.error), stack: errorStack(payload.error) },
      ...payload.extra,
    },
  ];

  const response = await fetch(logsIntakeUrl(config.site), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "dd-api-key": config.apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(
      `[datadog] log intake ${response.status} ${detail.slice(0, 200)}`.trim(),
    );
  }
}

/**
 * Ship one server span to Datadog OTLP HTTP intake (agentless APM on Vercel).
 */
export async function shipDatadogSpan(
  config: ServerObservabilityConfig,
  span: SpanPayload,
): Promise<void> {
  if (!span.error && span.ctx.samplingPriority === 0 && !shouldSampleRoutine(config.env)) {
    return;
  }

  const attributes = [
    attr("service.name", config.service),
    attr("deployment.environment", config.env),
    attr("service.version", config.version),
    attr("http.method", span.httpMethod),
    attr("http.status_code", span.httpStatus),
    attr("span.kind", "server"),
  ];
  if (span.errorMessage) attributes.push(attr("error.message", span.errorMessage));

  const body = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            attr("service.name", config.service),
            attr("deployment.environment", config.env),
            attr("service.version", config.version),
          ],
        },
        scopeSpans: [
          {
            scope: { name: "dealdex", version: config.version },
            spans: [
              {
                traceId: span.ctx.traceIdHex,
                spanId: span.ctx.spanIdHex,
                parentSpanId: span.ctx.parentSpanIdHex,
                name: span.name,
                kind: 2,
                startTimeUnixNano: span.startNs.toString(),
                endTimeUnixNano: span.endNs.toString(),
                attributes,
                status: {
                  code: span.error ? 2 : 1,
                  message: span.error ? span.errorMessage : undefined,
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch(tracesIntakeUrl(config.site), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "dd-api-key": config.apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(
      `[datadog] trace intake ${response.status} ${detail.slice(0, 200)}`.trim(),
    );
  }
}

export function nowNs(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

export function shouldShipLog(status: DatadogLogStatus, envName: string): boolean {
  if (logStatusRank(status) >= logStatusRank("warn")) return true;
  return envName !== "production" || shouldSampleRoutine(envName);
}
