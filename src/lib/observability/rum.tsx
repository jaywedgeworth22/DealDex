import { useEffect, useRef } from "react";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum, type RumEvent, type Site } from "@datadog/browser-rum-slim";
import type { RumPublicConfig } from "./config";

function hostMatchesDealDex(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.hostname === "dealdex.net" || url.hostname.endsWith(".dealdex.net");
  } catch {
    return false;
  }
}

function isSameOrigin(urlString: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(urlString).origin === window.location.origin;
  } catch {
    return false;
  }
}

function stripSensitiveRum(event: RumEvent): boolean {
  if (event.type === "resource" && event.resource.url) {
    try {
      const parsed = new URL(
        event.resource.url,
        typeof window === "undefined" ? "https://dealdex.net" : window.location.href,
      );
      parsed.searchParams.delete("key");
      parsed.searchParams.delete("token");
      parsed.searchParams.delete("apiKey");
      event.resource.url = parsed.toString();
    } catch {
      // Keep the original event.  Never drop an error to hide it.
    }
  }
  return true;
}

export function DatadogRum({ config }: { config: RumPublicConfig | null }) {
  const started = useRef(false);

  useEffect(() => {
    if (!config || started.current) return;
    started.current = true;

    const site = config.site as Site;

    datadogRum.init({
      applicationId: config.applicationId,
      clientToken: config.clientToken,
      site,
      service: config.service,
      env: config.env,
      version: config.version,
      sessionSampleRate: config.env === "production" ? 20 : 100,
      sessionReplaySampleRate: 0,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingUrls: [
        (url: string) => hostMatchesDealDex(url) || isSameOrigin(url),
      ],
      beforeSend: (event) => stripSensitiveRum(event),
    });

    datadogLogs.init({
      clientToken: config.clientToken,
      site,
      service: config.service,
      env: config.env,
      version: config.version,
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });
  }, [config]);

  return null;
}
