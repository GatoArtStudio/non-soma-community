import type { SessionUser } from "./session-user";

export interface SessionRepository {
  create(session: { tokenHash: string; userId: number; expiresAt: Date }): Promise<void>;
  findActiveUser(tokenHash: string, now: Date): Promise<SessionUser | null>;
  delete(tokenHash: string): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}
