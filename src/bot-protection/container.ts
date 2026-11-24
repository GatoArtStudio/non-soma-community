import "server-only";
import { getEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/client";
import { createGuardHumanAction } from "./application/guard-human-action";
import { MySqlRateLimiter } from "./infrastructure/mysql.rate-limiter";
import { TurnstileVerifier } from "./infrastructure/turnstile.verifier";

export function getRateLimiter() {
  return new MySqlRateLimiter(getDb());
}

export function getGuardHumanAction() {
  const env = getEnv();
  return createGuardHumanAction({
    verifier: new TurnstileVerifier(env.TURNSTILE_SECRET_KEY, env.TURNSTILE_EXPECTED_HOSTNAME),
    limiter: getRateLimiter(),
  });
}
