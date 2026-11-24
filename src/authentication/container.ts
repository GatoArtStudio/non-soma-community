import "server-only";
import { getEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/client";
import { getKickApiClient } from "@/kick-platform/kick-platform";
import { createKickLogin } from "./application/kick-login";
import { createSessionAccess } from "./application/session-access";
import { DrizzleSessionRepository } from "./infrastructure/drizzle-session.repository";
import { DrizzleUserRepository } from "./infrastructure/drizzle-user.repository";
import { KickOAuthClient } from "./infrastructure/kick.oauth";

export const KICK_CALLBACK_PATH = "/api/auth/kick/callback";

export function getKickLogin() {
  const env = getEnv();
  const db = getDb();
  return createKickLogin({
    oauth: new KickOAuthClient(
      {
        clientId: env.KICK_CLIENT_ID,
        clientSecret: env.KICK_CLIENT_SECRET,
        redirectUri: `${env.APP_URL}${KICK_CALLBACK_PATH}`,
      },
      getKickApiClient(),
    ),
    users: new DrizzleUserRepository(db),
    sessions: new DrizzleSessionRepository(db),
  });
}

export function getSessionAccess() {
  return createSessionAccess({ sessions: new DrizzleSessionRepository(getDb()) });
}
