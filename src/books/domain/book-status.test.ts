import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, isPublished } from "./book-status";

describe("book status", () => {
  it("allows the moderation lifecycle", () => {
    expect(canTransition("pending", "approved")).toBe(true);
    expect(canTransition("pending", "rejected")).toBe(true);
    expect(canTransition("approved", "reading")).toBe(true);
    expect(canTransition("reading", "read")).toBe(true);
    expect(canTransition("read", "approved")).toBe(true);
  });

  it("forbids skipping review", () => {
    expect(canTransition("pending", "reading")).toBe(false);
    expect(canTransition("pending", "read")).toBe(false);
    expect(() => assertTransition("rejected", "read")).toThrow();
  });

  it("only publishes reviewed books", () => {
    expect(isPublished("pending")).toBe(false);
    expect(isPublished("rejected")).toBe(false);
    expect(isPublished("approved")).toBe(true);
    expect(isPublished("read")).toBe(true);
  });
});
