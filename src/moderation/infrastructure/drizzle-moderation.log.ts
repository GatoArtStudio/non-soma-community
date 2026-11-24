import "server-only";
import { desc, eq } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import { usersTable } from "@/authentication/infrastructure/users.table";
import type {
  ModerationActionEntry,
  RecordedModerationAction,
} from "@/moderation/domain/moderation-action";
import type { ModerationLog } from "@/moderation/domain/moderation-log.port";
import { moderationActionsTable } from "./moderation-actions.table";

export class DrizzleModerationLog implements ModerationLog {
  constructor(private readonly db: Database) {}

  async record(entry: ModerationActionEntry): Promise<void> {
    await this.db.insert(moderationActionsTable).values({
      actorUserId: entry.actorUserId,
      action: entry.action,
      bookId: entry.bookId ?? null,
      bookTitle: entry.bookTitle?.slice(0, 300) ?? null,
      targetKickUserId: entry.targetKickUserId ?? null,
      detail: entry.detail ?? null,
    });
  }

  listRecent(limit: number): Promise<RecordedModerationAction[]> {
    return this.db
      .select({
        id: moderationActionsTable.id,
        actorUserId: moderationActionsTable.actorUserId,
        actorUsername: usersTable.username,
        action: moderationActionsTable.action,
        bookId: moderationActionsTable.bookId,
        bookTitle: moderationActionsTable.bookTitle,
        targetKickUserId: moderationActionsTable.targetKickUserId,
        detail: moderationActionsTable.detail,
        createdAt: moderationActionsTable.createdAt,
      })
      .from(moderationActionsTable)
      .leftJoin(usersTable, eq(usersTable.id, moderationActionsTable.actorUserId))
      .orderBy(desc(moderationActionsTable.id))
      .limit(limit);
  }
}
