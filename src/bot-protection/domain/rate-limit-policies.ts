import type { RateLimitRule } from "./rate-limiter.port";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

export const rateLimitPolicies = {
  anonymousProposalsPerNetwork: (networkHash: string): RateLimitRule => ({
    key: `propose:net:${networkHash}`,
    limit: 3,
    windowSeconds: DAY,
  }),
  userProposals: (userId: number): RateLimitRule => ({
    key: `propose:user:${userId}`,
    limit: 10,
    windowSeconds: DAY,
  }),
  likesPerNetwork: (networkHash: string): RateLimitRule => ({
    key: `like:net:${networkHash}`,
    limit: 30,
    windowSeconds: HOUR,
  }),
  catalogSearchesPerNetwork: (networkHash: string): RateLimitRule => ({
    key: `search:net:${networkHash}`,
    limit: 60,
    windowSeconds: 60,
  }),
  loginAttemptsPerNetwork: (networkHash: string): RateLimitRule => ({
    key: `login:net:${networkHash}`,
    limit: 20,
    windowSeconds: HOUR,
  }),
};
