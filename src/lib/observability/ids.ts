/** Trace / span id helpers for Datadog headers and OTLP intake. */

export type TraceContext = {
  traceIdHex: string;
  spanIdHex: string;
  parentSpanIdHex?: string;
  samplingPriority: number;
  origin?: string;
};

function randomHex(bytes: number): string {
  const out = new Uint8Array(bytes);
  crypto.getRandomValues(out);
  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newSpanIdHex(): string {
  return randomHex(8);
}

export function newTraceIdHex(): string {
  return randomHex(16);
}

function isHex(value: string): boolean {
  return /^[0-9a-fA-F]+$/.test(value);
}

export function hexToDecimal(hex: string): string {
  const clean = hex.replace(/^0+/, "") || "0";
  if (!isHex(clean)) return "0";
  return BigInt(`0x${clean}`).toString(10);
}

export function decimalToHex(decimal: string, width: number): string {
  try {
    return BigInt(decimal).toString(16).padStart(width, "0");
  } catch {
    return "".padStart(width, "0");
  }
}

export function parseIncomingTrace(headers: Headers): TraceContext {
  const traceparent = headers.get("traceparent");
  if (traceparent) {
    const parts = traceparent.split("-");
    if (parts.length >= 4 && parts[1] && parts[2] && isHex(parts[1]) && isHex(parts[2])) {
      const sampled = parts[3]?.endsWith("01") ? 1 : 0;
      return {
        traceIdHex: parts[1].padStart(32, "0").slice(-32),
        spanIdHex: newSpanIdHex(),
        parentSpanIdHex: parts[2].padStart(16, "0").slice(-16),
        samplingPriority: sampled,
        origin: headers.get("x-datadog-origin") ?? undefined,
      };
    }
  }

  const ddTrace = headers.get("x-datadog-trace-id");
  const ddParent = headers.get("x-datadog-parent-id");
  if (ddTrace) {
    const priorityRaw = headers.get("x-datadog-sampling-priority");
    const priority = priorityRaw === "0" ? 0 : 1;
    return {
      traceIdHex: decimalToHex(ddTrace, 32),
      spanIdHex: newSpanIdHex(),
      parentSpanIdHex: ddParent ? decimalToHex(ddParent, 16) : undefined,
      samplingPriority: priority,
      origin: headers.get("x-datadog-origin") ?? undefined,
    };
  }

  return {
    traceIdHex: newTraceIdHex(),
    spanIdHex: newSpanIdHex(),
    samplingPriority: 1,
  };
}

export function datadogTraceHeaders(ctx: TraceContext): Record<string, string> {
  const headers: Record<string, string> = {
    "x-datadog-trace-id": hexToDecimal(ctx.traceIdHex.slice(-16)),
    "x-datadog-parent-id": hexToDecimal(ctx.spanIdHex),
    "x-datadog-sampling-priority": String(ctx.samplingPriority),
    traceparent: `00-${ctx.traceIdHex}-${ctx.spanIdHex}-0${ctx.samplingPriority ? "1" : "0"}`,
  };
  if (ctx.origin) headers["x-datadog-origin"] = ctx.origin;
  return headers;
}
