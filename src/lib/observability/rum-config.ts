import { createServerFn } from "@tanstack/react-start";
import { requireRumPublicConfig, type RumPublicConfig } from "./config";

export type { RumPublicConfig };

/**
 * Public RUM fields only (application id + client token).
 * The API key never leaves the server.
 */
export const getRumPublicConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<RumPublicConfig | null> => {
    return requireRumPublicConfig(process.env);
  },
);
