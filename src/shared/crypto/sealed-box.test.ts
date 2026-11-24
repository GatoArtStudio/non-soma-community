import { describe, expect, it } from "vitest";
import { seal, unseal } from "./sealed-box";

const SECRET = "a".repeat(48);

describe("sealed box", () => {
  it("round-trips payloads for the same purpose", () => {
    const sealed = seal(SECRET, "login", { state: "abc" });
    expect(unseal(SECRET, "login", sealed)).toEqual({ state: "abc" });
  });

  it("rejects tampering, other purposes and other secrets", () => {
    const sealed = seal(SECRET, "login", { state: "abc" });
    const tampered = `${sealed.slice(0, -2)}${sealed.endsWith("A") ? "B" : "A"}A`;
    expect(unseal(SECRET, "login", tampered)).toBeNull();
    expect(unseal(SECRET, "other", sealed)).toBeNull();
    expect(unseal("b".repeat(48), "login", sealed)).toBeNull();
  });
});
