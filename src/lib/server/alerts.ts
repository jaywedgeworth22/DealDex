import { createServerFn } from "@tanstack/react-start";
import { ALERT_CHANNELS, type AlertChannel, type AlertHit } from "@/lib/alerts/types";
import { RateLimitedError, rateLimit, serverFnClientKey } from "./rate-limit";

type RemoteRule = {
  id: string;
  email: string;
  phone: string;
  pushoverUser: string;
  pushoverToken: string;
  channels: Record<AlertChannel, boolean>;
};

/**
 * Channels this build can actually deliver.
 *
 * Email and SMS have no provider wired up. They used to be offered in the UI and
 * recorded here as `ok: true` without a single request being made, so a user
 * could enable SMS alerts, see them "delivered", and never receive one. Until a
 * provider exists they are reported as unavailable and the UI disables them.
 */
export const DELIVERABLE_CHANNELS: Record<AlertChannel, boolean> = {
  native: true,
  pushover: true,
  email: false,
  sms: false,
};

export type AlertDelivery = {
  hitId: string;
  channel: AlertChannel;
  ok: boolean;
  /** Present when `ok` is false. Shown to the user rather than swallowed. */
  reason?: string;
};

const MAX_HITS = 25;
const MAX_RULES = 25;
const MAX_TEXT = 400;

function str(v: unknown, max = MAX_TEXT): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function cleanChannels(v: unknown): Record<AlertChannel, boolean> {
  const raw = (v ?? {}) as Record<string, unknown>;
  const out = {} as Record<AlertChannel, boolean>;
  for (const c of ALERT_CHANNELS) out[c] = raw[c] === true;
  return out;
}

function cleanRule(v: unknown): RemoteRule {
  const raw = (v ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id, 80),
    email: str(raw.email, 200),
    phone: str(raw.phone, 40),
    pushoverUser: str(raw.pushoverUser, 80),
    pushoverToken: str(raw.pushoverToken, 80),
    channels: cleanChannels(raw.channels),
  };
}

function cleanHit(v: unknown): AlertHit {
  const raw = (v ?? {}) as Record<string, unknown>;
  const url = str(raw.url, 500);
  return {
    id: str(raw.id, 120),
    at: num(raw.at) ?? Date.now(),
    ruleId: str(raw.ruleId, 80),
    ruleName: str(raw.ruleName, 120),
    title: str(raw.title, 240),
    // Only ever link back to a marketplace listing. Without this the handler is
    // a general-purpose "send anyone a push containing any URL" relay.
    url: /^https:\/\/(www\.)?(ebay|mercari)\.com\//i.test(url) ? url : "",
    price: num(raw.price),
    spread: num(raw.spread),
    verdict: (raw.verdict ?? null) as AlertHit["verdict"],
    marketplace: str(raw.marketplace, 20),
    channels: Array.isArray(raw.channels)
      ? (raw.channels.filter((c): c is AlertChannel =>
          (ALERT_CHANNELS as readonly string[]).includes(c as string),
        ) as AlertChannel[])
      : [],
  };
}

/**
 * Fan out alert hits to the remote channels a rule asked for.
 *
 * Deliberately usable signed out — alert rules live on the device and guests are
 * a supported mode — so instead of a session gate this relies on:
 *   - `assertSameSiteRequest()`, which rejects scripted cross-site calls, so a
 *     third-party page cannot drive it;
 *   - strict validation, so the message body and link are not attacker-shaped;
 *   - a rate limit, so it cannot be run as a bulk relay.
 * Pushover credentials stay the caller's own — we never hold them.
 */
export const dispatchRemoteAlerts = createServerFn({ method: "POST" })
  .validator((input: { hits: AlertHit[]; rules: RemoteRule[] }) => ({
    hits: (Array.isArray(input?.hits) ? input.hits : []).slice(0, MAX_HITS).map(cleanHit),
    rules: (Array.isArray(input?.rules) ? input.rules : []).slice(0, MAX_RULES).map(cleanRule),
  }))
  .handler(async ({ data }): Promise<{ sent: AlertDelivery[] }> => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();

    const limit = rateLimit(serverFnClientKey("alerts"), 30, 60_000);
    if (!limit.ok) throw new RateLimitedError(limit.retryAfterMs);

    const byId = new Map(data.rules.map((r) => [r.id, r]));
    const sent: AlertDelivery[] = [];

    for (const hit of data.hits) {
      const rule = byId.get(hit.ruleId);
      if (!rule) continue;

      if (rule.channels.pushover && rule.pushoverUser && rule.pushoverToken) {
        try {
          const body = new URLSearchParams({
            token: rule.pushoverToken,
            user: rule.pushoverUser,
            title: `DealDex · ${rule.id === hit.ruleId ? hit.ruleName : "Alert"}`,
            message:
              `${hit.title}\n${hit.marketplace} ${hit.price != null ? `$${hit.price}` : ""}`.trim(),
            ...(hit.url ? { url: hit.url, url_title: "Open listing" } : {}),
          });
          const res = await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });
          sent.push({
            hitId: hit.id,
            channel: "pushover",
            ok: res.ok,
            ...(res.ok ? {} : { reason: `Pushover returned ${res.status}` }),
          });
        } catch {
          sent.push({
            hitId: hit.id,
            channel: "pushover",
            ok: false,
            reason: "Could not reach Pushover",
          });
        }
      }

      // Report the truth: nothing is sent, so nothing is claimed.
      for (const channel of ["email", "sms"] as const) {
        if (!rule.channels[channel]) continue;
        if (channel === "email" && !rule.email) continue;
        if (channel === "sms" && !rule.phone) continue;
        sent.push({
          hitId: hit.id,
          channel,
          ok: false,
          reason: `${channel === "email" ? "Email" : "SMS"} delivery is not available yet.`,
        });
      }
    }

    return { sent };
  });
