import "server-only";
import { connection } from "next/server";
import { getEnv } from "./env";

/**
 * Runtime values that are safe to send to the browser. Awaiting `connection()` keeps them
 * out of the build-time prerender, so Docker images stay environment-agnostic.
 */
export async function getPublicConfig() {
  await connection();
  const env = getEnv();
  return { turnstileSiteKey: env.TURNSTILE_SITE_KEY, kickChannelSlug: env.KICK_CHANNEL_SLUG };
}
