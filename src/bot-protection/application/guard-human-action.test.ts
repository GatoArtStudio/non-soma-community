import { describe, expect, it, vi } from "vitest";
import { createGuardHumanAction } from "./guard-human-action";

const rule = { key: "k", limit: 1, windowSeconds: 60 };

describe("guardHumanAction", () => {
  it("rejects rate-limited callers without calling the verifier", async () => {
    const verify = vi.fn(async () => true);
    const guard = createGuardHumanAction({
      verifier: { verify },
      limiter: { consume: async () => false },
    });

    await expect(
      guard({ action: "like_book", verificationToken: "t", remoteIp: null, rateLimits: [rule] }),
    ).rejects.toMatchObject({ code: "rate_limited" });
    expect(verify).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid tokens", async () => {
    const guard = createGuardHumanAction({
      verifier: { verify: async () => false },
      limiter: { consume: async () => true },
    });

    await expect(
      guard({ action: "like_book", verificationToken: "", remoteIp: null, rateLimits: [] }),
    ).rejects.toMatchObject({ code: "human_verification_failed" });
    await expect(
      guard({ action: "like_book", verificationToken: "bad", remoteIp: null, rateLimits: [] }),
    ).rejects.toMatchObject({ code: "human_verification_failed" });
  });

  it("passes verified humans within limits", async () => {
    const guard = createGuardHumanAction({
      verifier: { verify: async () => true },
      limiter: { consume: async () => true },
    });

    await expect(
      guard({
        action: "propose_book",
        verificationToken: "ok",
        remoteIp: null,
        rateLimits: [rule],
      }),
    ).resolves.toBeUndefined();
  });
});
