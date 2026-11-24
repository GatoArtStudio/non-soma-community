import { DomainError } from "@/shared/errors/domain-error";
import type { HumanAction, HumanVerifier } from "@/bot-protection/domain/human-verifier.port";
import type { RateLimiter, RateLimitRule } from "@/bot-protection/domain/rate-limiter.port";

export type BotProtectionErrorCode = "rate_limited" | "human_verification_failed";

export interface HumanActionAttempt {
  action: HumanAction;
  verificationToken: string;
  remoteIp: string | null;
  rateLimits: RateLimitRule[];
}

export function createGuardHumanAction(deps: { verifier: HumanVerifier; limiter: RateLimiter }) {
  return async function guardHumanAction(attempt: HumanActionAttempt): Promise<void> {
    // Rate limits run first so a flood of requests never reaches the verification API.
    for (const rule of attempt.rateLimits) {
      if (!(await deps.limiter.consume(rule))) {
        throw new DomainError<BotProtectionErrorCode>("rate_limited");
      }
    }

    if (!attempt.verificationToken) {
      throw new DomainError<BotProtectionErrorCode>("human_verification_failed");
    }

    const verified = await deps.verifier.verify({
      token: attempt.verificationToken,
      action: attempt.action,
      remoteIp: attempt.remoteIp,
    });
    if (!verified) {
      throw new DomainError<BotProtectionErrorCode>("human_verification_failed");
    }
  };
}

export type GuardHumanAction = ReturnType<typeof createGuardHumanAction>;
