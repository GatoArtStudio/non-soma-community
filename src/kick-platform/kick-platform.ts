import "server-only";
import { getEnv } from "@/shared/config/env";
import { KickApiClient } from "./infrastructure/kick-api.client";

const globalForKick = globalThis as unknown as { nonSomaKickClient?: KickApiClient };

/** Shared instance so the app access token is cached across requests. */
export function getKickApiClient(): KickApiClient {
  if (!globalForKick.nonSomaKickClient) {
    const env = getEnv();
    globalForKick.nonSomaKickClient = new KickApiClient(env.KICK_CLIENT_ID, env.KICK_CLIENT_SECRET);
  }
  return globalForKick.nonSomaKickClient;
}
