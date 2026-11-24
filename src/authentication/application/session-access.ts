import { sha256Hex } from "@/shared/crypto/tokens";
import type { SessionRepository } from "@/authentication/domain/session.repository";
import type { SessionUser } from "@/authentication/domain/session-user";

export function createSessionAccess(deps: { sessions: SessionRepository; now?: () => Date }) {
  const now = deps.now ?? (() => new Date());

  async function getSessionUser(sessionToken: string | undefined): Promise<SessionUser | null> {
    if (!sessionToken || sessionToken.length > 128) return null;
    return deps.sessions.findActiveUser(sha256Hex(sessionToken), now());
  }

  async function endSession(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken || sessionToken.length > 128) return;
    await deps.sessions.delete(sha256Hex(sessionToken));
  }

  return { getSessionUser, endSession };
}
