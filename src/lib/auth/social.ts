import type { SocialProviderId } from "./providers";

type Pair = { clientId: string; clientSecret: string };

function pair(idKey: string, secretKey: string, altId?: string, altSecret?: string): Pair | undefined {
  const clientId = (process.env[idKey] ?? (altId ? process.env[altId] : undefined))?.trim();
  const clientSecret = (process.env[secretKey] ?? (altSecret ? process.env[altSecret] : undefined))?.trim();
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

/** Google / Apple / X (Twitter) client creds from env. Missing providers are omitted. */
export function socialProviderConfig(): {
  google?: Pair;
  apple?: Pair & { appBundleIdentifier?: string };
  twitter?: Pair;
} {
  const google = pair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
  const appleBase = pair("APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET");
  const twitter = pair("TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET", "X_CLIENT_ID", "X_CLIENT_SECRET");
  const appleBundle = process.env.APPLE_APP_BUNDLE_IDENTIFIER?.trim() || process.env.APPLE_BUNDLE_ID?.trim();
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
