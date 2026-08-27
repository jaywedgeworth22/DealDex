import { dispatchRemoteAlerts } from "@/lib/server/alerts";
import type { AlertHit, AlertRule } from "./types";

export async function ensureNativePermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export function showNativeHit(hit: AlertHit) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const body = [
    hit.verdict ? hit.verdict.toUpperCase() : "HIT",
    hit.price != null ? `$${hit.price.toFixed(2)}` : null,
    hit.marketplace,
  ]
    .filter(Boolean)
    .join(" · ");
  try {
    const n = new Notification(hit.ruleName || "DealDex", {
      body: `${hit.title}\n${body}`,
      tag: hit.id,
      icon: "/favicon.png",
    });
    n.onclick = () => {
      window.focus();
      window.open(hit.url, "_blank", "noreferrer");
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export async function dispatchHits(hits: AlertHit[], rules: AlertRule[]) {
  if (!hits.length) return;
  const nativeHits = hits.filter((h) => h.channels.includes("native"));
  if (nativeHits.length) {
    const perm = await ensureNativePermission();
    if (perm === "granted") nativeHits.forEach(showNativeHit);
  }
  // Only channels the server can actually deliver. Email and SMS have no
  // provider, so sending them would just collect failures the user cannot act on.
  const remote = hits.filter((h) => h.channels.includes("pushover"));
  if (!remote.length) return;
  try {
    const res = await dispatchRemoteAlerts({
      data: {
        hits: remote,
        rules: rules.map((r) => ({
          id: r.id,
          email: r.email,
          phone: r.phone,
          pushoverUser: r.pushoverUser,
          pushoverToken: r.pushoverToken,
          channels: r.channels,
        })),
      },
    });
    const failed = res.sent.filter((s) => !s.ok);
    if (failed.length) {
      // Say so. Silently dropping a delivery failure is how "alerts are on" and
      // "alerts arrive" drifted apart in the first place.
      const { toast } = await import("sonner");
      toast(failed[0]!.reason ?? "An alert could not be delivered.");
    }
  } catch {
    /* offline / preview — hits still logged locally */
  }
}
