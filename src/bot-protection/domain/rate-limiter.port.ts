export interface RateLimitRule {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimiter {
  /** Registers one hit and reports whether the caller is still within the limit. */
  consume(rule: RateLimitRule): Promise<boolean>;
}
