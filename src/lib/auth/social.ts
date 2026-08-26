import type { SocialProviderId } from "./providers";

type Pair = { clientId: string; clientSecret: string };

function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const val = process.env[k]?.trim();
    if (val) return val;
  }
  return undefined;
}

function resolvePair(idKeys: string[], secretKeys: string[]): Pair | undefined {
  const clientId = firstEnv(...idKeys);
  const clientSecret = firstEnv(...secretKeys);
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

/** Google / Apple / X (Twitter) client creds from env. Missing providers are omitted. */
export function socialProviderConfig(): {
  google?: Pair;
  apple?: Pair & { appBundleIdentifier?: string };
  twitter?: Pair;
} {
  const google = resolvePair(
    ["GOOGLE_CLIENT_ID", "DD_WEB_GOOGLE_ID", "DEALDEX_GOOGLE_CLIENT_ID", "DEALDEX_WEB_GOOGLE_ID"],
    ["GOOGLE_CLIENT_SECRET", "DD_WEB_GOOGLE_SECRET", "DEALDEX_GOOGLE_CLIENT_SECRET", "DEALDEX_WEB_GOOGLE_SECRET"]
  );
  const appleBase = resolvePair(
    ["APPLE_CLIENT_ID", "DEALDEX_APPLE_CLIENT_ID", "DD_APPLE_CLIENT_ID"],
    ["APPLE_CLIENT_SECRET", "DEALDEX_APPLE_CLIENT_SECRET", "DD_APPLE_CLIENT_SECRET"]
  );
  const twitter = resolvePair(
    ["TWITTER_CLIENT_ID", "X_CLIENT_ID", "DEALDEX_X_CLIENT_ID", "DD_X_CLIENT_ID"],
    ["TWITTER_CLIENT_SECRET", "X_CLIENT_SECRET", "DEALDEX_X_CLIENT_SECRET", "DD_X_CLIENT_SECRET"]
  );
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

