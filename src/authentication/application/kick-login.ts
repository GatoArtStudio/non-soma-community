import { generateToken, safeEqual, sha256Base64Url, sha256Hex } from "@/shared/crypto/tokens";
import { DomainError } from "@/shared/errors/domain-error";
import type { KickOAuth } from "@/authentication/domain/kick-oauth.port";
import {
  PENDING_LOGIN_TTL_MS,
  sanitizeReturnTo,
  type PendingLogin,
} from "@/authentication/domain/pending-login";
import type { SessionRepository } from "@/authentication/domain/session.repository";
import type { UserRepository } from "@/authentication/domain/user.repository";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type LoginErrorCode = "invalid_login_state" | "kick_login_failed";

export interface StartedLogin {
  authorizeUrl: string;
  pending: PendingLogin;
}

export interface CompletedLogin {
  sessionToken: string;
  expiresAt: Date;
  returnTo: string;
}

export function createKickLogin(deps: {
  oauth: KickOAuth;
  users: UserRepository;
  sessions: SessionRepository;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());

  function startKickLogin(returnTo: string | null): StartedLogin {
    const state = generateToken(24);
    const codeVerifier = generateToken(48);
    return {
      authorizeUrl: deps.oauth.buildAuthorizeUrl({
        state,
        codeChallenge: sha256Base64Url(codeVerifier),
      }),
      pending: {
        state,
        codeVerifier,
        returnTo: sanitizeReturnTo(returnTo),
        expiresAt: now().getTime() + PENDING_LOGIN_TTL_MS,
      },
    };
  }

  async function completeKickLogin(input: {
    code: string | null;
    state: string | null;
    pending: PendingLogin | null;
  }): Promise<CompletedLogin> {
    const { code, state, pending } = input;
    if (
      !code ||
      !state ||
      !pending ||
      pending.expiresAt < now().getTime() ||
      !safeEqual(state, pending.state)
    ) {
      throw new DomainError<LoginErrorCode>("invalid_login_state");
    }

    let identity;
    try {
      const accessToken = await deps.oauth.exchangeCode({
        code,
        codeVerifier: pending.codeVerifier,
      });
      identity = await deps.oauth.fetchIdentity(accessToken);
      // The app only needs the identity, so the Kick token is discarded right away.
      await deps.oauth.revokeToken(accessToken).catch(() => undefined);
    } catch {
      throw new DomainError<LoginErrorCode>("kick_login_failed");
    }

    const user = await deps.users.upsertFromKick(identity);
    const sessionToken = generateToken(32);
    const expiresAt = new Date(now().getTime() + SESSION_TTL_MS);
    await deps.sessions.create({ tokenHash: sha256Hex(sessionToken), userId: user.id, expiresAt });
    await deps.sessions.deleteExpired(now());

    return { sessionToken, expiresAt, returnTo: pending.returnTo };
  }

  return { startKickLogin, completeKickLogin };
}
