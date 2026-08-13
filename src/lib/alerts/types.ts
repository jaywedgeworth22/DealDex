import type { Verdict } from "@/lib/tcg/types";
import type { ScanSource } from "@/lib/marketplaces/types";

export const ALERT_CHANNELS = ["native", "email", "sms", "pushover"] as const;
export type AlertChannel = (typeof ALERT_CHANNELS)[number];

export type AlertRule = {
  id: string;
  enabled: boolean;
  name: string;
  keyword: string;
  marketplaces: ScanSource[];
  verdicts: Verdict[];
  minSpread: number | null;
  maxPrice: number | null;
  condition: "any" | "raw" | "graded";
  channels: Record<AlertChannel, boolean>;
  email: string;
  phone: string;
  pushoverUser: string;
  pushoverToken: string;
};

export type AlertHit = {
  id: string;
  at: number;
  ruleId: string;
  ruleName: string;
  title: string;
  url: string;
  price: number | null;
  spread: number | null;
  verdict: Verdict | null;
  marketplace: string;
  channels: AlertChannel[];
};

export function defaultRule(): AlertRule {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    name: "Steals under $100",
    keyword: "",
    marketplaces: ["ebay", "mercari"],
    verdicts: ["steal", "good"],
    minSpread: 0.12,
    maxPrice: 100,
    condition: "any",
    channels: { native: true, email: false, sms: false, pushover: false },
    email: "",
    phone: "",
    pushoverUser: "",
    pushoverToken: "",
  };
}
