import type { RateLimitRule } from "./rate-limiter.port";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** Action limits per Kick account or per device cookie. IPs are never used to identify people. */
export const rateLimitPolicies = {
  anonymousProposals: (visitorHash: string): RateLimitRule => ({
    key: `propose:visitor:${visitorHash}`,
    limit: 3,
    windowSeconds: DAY,
  }),
  userProposals: (userId: number): RateLimitRule => ({
    key: `propose:user:${userId}`,
    limit: 10,
    windowSeconds: DAY,
  }),
  likes: (likerKey: string): RateLimitRule => ({
    key: `like:${likerKey}`,
    limit: 60,
    windowSeconds: HOUR,
  }),
};
