import { describe, expect, it } from "vitest";
import { normalizeNetwork } from "./network";

describe("normalizeNetwork", () => {
  it("keeps IPv4 addresses", () => {
    expect(normalizeNetwork("203.0.113.5")).toBe("203.0.113.5");
  });

  it("groups IPv6 addresses by /64 regardless of notation", () => {
    expect(normalizeNetwork("2001:db8::1")).toBe("2001:0db8:0000:0000");
    expect(normalizeNetwork("2001:db8:0:0:ffff::2")).toBe("2001:0db8:0000:0000");
    expect(normalizeNetwork("2001:DB8:1:2:3:4:5:6")).toBe("2001:0db8:0001:0002");
  });
});
