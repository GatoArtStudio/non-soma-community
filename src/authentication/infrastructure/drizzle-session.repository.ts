import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import type { SessionRepository } from "@/authentication/domain/session.repository";
import type { SessionUser } from "@/authentication/domain/session-user";
import { sessionsTable } from "./sessions.table";
import { usersTable } from "./users.table";

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

  async create(session: { tokenHash: string; userId: number; expiresAt: Date }): Promise<void> {
    await this.db.insert(sessionsTable).values(session);
  }

  async findActiveUser(tokenHash: string, now: Date): Promise<SessionUser | null> {
    const [row] = await this.db
      .select({
        id: usersTable.id,
        kickUserId: usersTable.kickUserId,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
      .where(and(eq(sessionsTable.tokenHash, tokenHash), gt(sessionsTable.expiresAt, now)))
      .limit(1);
    return row ?? null;
  }

  async delete(tokenHash: string): Promise<void> {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, tokenHash));
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, now));
  }
}
