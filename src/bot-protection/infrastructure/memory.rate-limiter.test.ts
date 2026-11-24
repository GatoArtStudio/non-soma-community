import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "./memory.rate-limiter";

const rule = { key: "get:203.0.113.5", limit: 2, windowSeconds: 60 };

describe("MemoryRateLimiter", () => {
  it("allows requests up to the limit within a window", () => {
    const limiter = new MemoryRateLimiter();
    const now = 1_000_000;

    expect(limiter.consume(rule, now)).toBe(true);
    expect(limiter.consume(rule, now + 1)).toBe(true);
    expect(limiter.consume(rule, now + 2)).toBe(false);
  });

  it("starts a new window after it expires", () => {
    const limiter = new MemoryRateLimiter();
    const now = 1_000_000;
    limiter.consume(rule, now);
    limiter.consume(rule, now);

    expect(limiter.consume(rule, now + 60_001)).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = new MemoryRateLimiter();
    const now = 1_000_000;
    limiter.consume(rule, now);
    limiter.consume(rule, now);

    expect(limiter.consume({ ...rule, key: "get:198.51.100.7" }, now)).toBe(true);
  });
});
