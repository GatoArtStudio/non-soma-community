import "server-only";
import { asc, eq } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import type { Moderator } from "@/moderators/domain/moderator";
import type { ModeratorRepository } from "@/moderators/domain/moderator.repository";
import { moderatorsTable } from "./moderators.table";

const moderatorColumns = {
  kickUserId: moderatorsTable.kickUserId,
  username: moderatorsTable.username,
  source: moderatorsTable.source,
  grantedAt: moderatorsTable.grantedAt,
  revokedAt: moderatorsTable.revokedAt,
};

export class DrizzleModeratorRepository implements ModeratorRepository {
  constructor(private readonly db: Database) {}

  async findByKickUserId(kickUserId: number): Promise<Moderator | null> {
    const [row] = await this.db
      .select(moderatorColumns)
      .from(moderatorsTable)
      .where(eq(moderatorsTable.kickUserId, kickUserId))
      .limit(1);
    return row ?? null;
  }

  list(): Promise<Moderator[]> {
    return this.db
      .select(moderatorColumns)
      .from(moderatorsTable)
      .orderBy(asc(moderatorsTable.username));
  }

  async grant(input: Parameters<ModeratorRepository["grant"]>[0]): Promise<void> {
    const now = new Date();
    await this.db
      .insert(moderatorsTable)
      .values({ ...input, grantedAt: now })
      .onDuplicateKeyUpdate({
        set: {
          username: input.username,
          source: input.source,
          grantedByUserId: input.grantedByUserId,
          grantedAt: now,
          revokedAt: null,
          revokedByUserId: null,
        },
      });
  }

  async updateUsername(kickUserId: number, username: string): Promise<void> {
    await this.db
      .update(moderatorsTable)
      .set({ username })
      .where(eq(moderatorsTable.kickUserId, kickUserId));
  }

  async revoke(kickUserId: number, revokedByUserId: number): Promise<void> {
    await this.db
      .update(moderatorsTable)
      .set({ revokedAt: new Date(), revokedByUserId })
      .where(eq(moderatorsTable.kickUserId, kickUserId));
  }
}
