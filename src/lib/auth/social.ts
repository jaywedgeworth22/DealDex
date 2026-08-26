import type { SocialProviderId } from "./providers";

type Pair = { clientId: string; clientSecret: string };

function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const val = process.env[k]?.trim();
    if (val) return val;
  }
  return undefined;
}

function resolvePair(candidatePairs: Array<[idKey: string, secretKey: string]>): Pair | undefined {
  for (const [idKey, secretKey] of candidatePairs) {
    const clientId = process.env[idKey]?.trim();
    const clientSecret = process.env[secretKey]?.trim();
    if (clientId && clientSecret) {
      return { clientId, clientSecret };
    }
  }
  return undefined;
}

/** Google / Apple / X (Twitter) client creds from env. Missing providers are omitted. */
export function socialProviderConfig(): {
  google?: Pair;
  apple?: Pair & { appBundleIdentifier?: string };
  twitter?: Pair;
} {
  const google = resolvePair([
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    ["DD_WEB_GOOGLE_ID", "DD_WEB_GOOGLE_SECRET"],
    ["DEALDEX_GOOGLE_CLIENT_ID", "DEALDEX_GOOGLE_CLIENT_SECRET"],
    ["DEALDEX_WEB_GOOGLE_ID", "DEALDEX_WEB_GOOGLE_SECRET"],
  ]);
  const appleBase = resolvePair([
    ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
    ["DEALDEX_APPLE_CLIENT_ID", "DEALDEX_APPLE_CLIENT_SECRET"],
    ["DD_APPLE_CLIENT_ID", "DD_APPLE_CLIENT_SECRET"],
  ]);
  const twitter = resolvePair([
    ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
    ["X_CLIENT_ID", "X_CLIENT_SECRET"],
    ["DEALDEX_X_CLIENT_ID", "DEALDEX_X_CLIENT_SECRET"],
    ["DD_X_CLIENT_ID", "DD_X_CLIENT_SECRET"],
  ]);
  const appleBundle =
    firstEnv("APPLE_APP_BUNDLE_IDENTIFIER", "APPLE_BUNDLE_ID", "DEALDEX_APPLE_BUNDLE_ID") || "net.dealdex";

  return {
    ...(google ? { google } : {}),
    ...(appleBase
      ? {
          apple: {
            ...appleBase,
            ...(appleBundle ? { appBundleIdentifier: appleBundle } : {}),
          },
        }
      : {}),
    ...(twitter ? { twitter } : {}),
  };
}

export function hasSocialProvider(id: SocialProviderId, cfg = socialProviderConfig()): boolean {
  return Boolean(cfg[id]);
}

