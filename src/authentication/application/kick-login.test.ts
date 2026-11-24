import { describe, expect, it, vi } from "vitest";
import type { KickOAuth } from "@/authentication/domain/kick-oauth.port";
import { sanitizeReturnTo } from "@/authentication/domain/pending-login";
import type { SessionRepository } from "@/authentication/domain/session.repository";
import { sha256Base64Url } from "@/shared/crypto/tokens";
import { createKickLogin } from "./kick-login";

function setup() {
  const oauth: KickOAuth = {
    buildAuthorizeUrl: ({ state, codeChallenge }) =>
      `https://id.kick.com/oauth/authorize?state=${state}&code_challenge=${codeChallenge}`,
    exchangeCode: vi.fn(async () => "kick-access-token"),
    fetchIdentity: async () => ({ kickUserId: 77, username: "lectora", avatarUrl: null }),
    revokeToken: vi.fn(async () => undefined),
  };
  const sessions: SessionRepository = {
    create: vi.fn(async () => undefined),
    findActiveUser: async () => null,
    delete: async () => undefined,
    deleteExpired: async () => undefined,
  };
  const login = createKickLogin({
    oauth,
    sessions,
    users: { upsertFromKick: async (identity) => ({ id: 3, ...identity }) },
  });
  return { oauth, sessions, login };
}

describe("kick login", () => {
  it("uses PKCE S256 and completes with a new session", async () => {
    const { oauth, sessions, login } = setup();
    const { authorizeUrl, pending } = login.startKickLogin("/panel");

    expect(authorizeUrl).toContain(`code_challenge=${sha256Base64Url(pending.codeVerifier)}`);

    const result = await login.completeKickLogin({ code: "code", state: pending.state, pending });

    expect(result.returnTo).toBe("/panel");
    expect(result.sessionToken.length).toBeGreaterThan(30);
    expect(oauth.exchangeCode).toHaveBeenCalledWith({
      code: "code",
      codeVerifier: pending.codeVerifier,
    });
    expect(oauth.revokeToken).toHaveBeenCalledWith("kick-access-token");
    expect(sessions.create).toHaveBeenCalledOnce();
  });

  it("rejects mismatched or missing state", async () => {
    const { login } = setup();
    const { pending } = login.startKickLogin(null);

    await expect(
      login.completeKickLogin({ code: "code", state: "forged", pending }),
    ).rejects.toMatchObject({ code: "invalid_login_state" });
    await expect(
      login.completeKickLogin({ code: "code", state: pending.state, pending: null }),
    ).rejects.toMatchObject({ code: "invalid_login_state" });
  });

  it("only redirects to local paths", () => {
    expect(sanitizeReturnTo("/libros?q=1")).toBe("/libros?q=1");
    expect(sanitizeReturnTo("https://evil.example")).toBe("/");
    expect(sanitizeReturnTo("//evil.example")).toBe("/");
    expect(sanitizeReturnTo("/\\evil.example")).toBe("/");
  });
});
