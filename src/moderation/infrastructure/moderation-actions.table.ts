import {
  bigint,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  serial,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { usersTable } from "@/authentication/infrastructure/users.table";
import { MODERATION_ACTION_TYPES } from "@/moderation/domain/moderation-action";

export const moderationActionsTable = mysqlTable(
  "moderation_actions",
  {
    id: serial("id").primaryKey(),
    actorUserId: bigint("actor_user_id", { mode: "number", unsigned: true }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    action: mysqlEnum("action", MODERATION_ACTION_TYPES).notNull(),
    bookId: bigint("book_id", { mode: "number", unsigned: true }),
    bookTitle: varchar("book_title", { length: 300 }),
    targetKickUserId: bigint("target_kick_user_id", { mode: "number", unsigned: true }),
    detail: varchar("detail", { length: 300 }),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("moderation_actions_created_idx").on(table.createdAt)],
);
