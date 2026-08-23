/**
 * Sign-in providers this app talks to directly (Better Auth socialProviders).
 *
 * Not the old Grok/xAI broker. Google, Apple, and X (Twitter OAuth 2) use this
 * app's own client id/secret from env. Callback paths are Better Auth defaults:
 * `/api/auth/callback/google`, `/api/auth/callback/apple`, `/api/auth/callback/twitter`.
 */
export type SocialProviderId = "google" | "apple" | "twitter";

export type SocialProvider = {
  id: SocialProviderId;
  label: string;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "twitter", label: "X" },
];

export const SOCIAL_PROVIDER_IDS = new Set<string>(SOCIAL_PROVIDERS.map((p) => p.id));
