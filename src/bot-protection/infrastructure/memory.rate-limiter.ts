import type { RateLimitRule } from "@/bot-protection/domain/rate-limiter.port";

const SWEEP_INTERVAL_MS = 60_000;

/**
 * Fixed-window counter kept in this process's memory. Meant for coarse request throttling in
 * the proxy, where a database round trip per request would cost more than it protects.
 */
export class MemoryRateLimiter {
  private readonly windows = new Map<string, { count: number; resetsAt: number }>();
  private lastSweep = Date.now();

  consume({ key, limit, windowSeconds }: RateLimitRule, now = Date.now()): boolean {
    this.sweep(now);
    const current = this.windows.get(key);
    if (!current || current.resetsAt <= now) {
      this.windows.set(key, { count: 1, resetsAt: now + windowSeconds * 1000 });
      return true;
    }
    current.count += 1;
    return current.count <= limit;
  }

  private sweep(now: number): void {
    if (now - this.lastSweep < SWEEP_INTERVAL_MS) return;
    this.lastSweep = now;
    for (const [key, window] of this.windows) {
      if (window.resetsAt <= now) this.windows.delete(key);
    }
  }
}
