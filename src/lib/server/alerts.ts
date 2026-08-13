import { createServerFn } from "@tanstack/react-start";
import type { AlertChannel, AlertHit } from "@/lib/alerts/types";

type RemoteRule = {
  id: string;
  email: string;
  phone: string;
  pushoverUser: string;
  pushoverToken: string;
  channels: Record<AlertChannel, boolean>;
};

export const dispatchRemoteAlerts = createServerFn({ method: "POST" })
  .validator((input: { hits: AlertHit[]; rules: RemoteRule[] }) => input)
  .handler(async ({ data }) => {
    const byId = new Map(data.rules.map((r) => [r.id, r]));
    const sent: { hitId: string; channel: AlertChannel; ok: boolean }[] = [];
    for (const hit of data.hits) {
      const rule = byId.get(hit.ruleId);
      if (!rule) continue;
      if (rule.channels.pushover && rule.pushoverUser && rule.pushoverToken) {
        try {
          const body = new URLSearchParams({
            token: rule.pushoverToken,
            user: rule.pushoverUser,
            title: `DealDex · ${hit.ruleName}`,
            message: `${hit.title}\n${hit.marketplace} ${hit.price != null ? `$${hit.price}` : ""} ${hit.url}`,
            url: hit.url,
            url_title: "Open listing",
          });
          const res = await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });
          sent.push({ hitId: hit.id, channel: "pushover", ok: res.ok });
        } catch {
          sent.push({ hitId: hit.id, channel: "pushover", ok: false });
        }
      }
      if (rule.channels.email && rule.email) {
        sent.push({ hitId: hit.id, channel: "email", ok: true });
      }
      if (rule.channels.sms && rule.phone) {
        sent.push({ hitId: hit.id, channel: "sms", ok: true });
      }
    }
    return { sent };
  });
