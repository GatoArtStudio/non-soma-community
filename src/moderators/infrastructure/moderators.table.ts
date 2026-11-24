import {
  bigint,
  datetime,
  mysqlEnum,
  mysqlTable,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { usersTable } from "@/authentication/infrastructure/users.table";

export const moderatorsTable = mysqlTable(
  "moderators",
  {
    id: serial("id").primaryKey(),
    kickUserId: bigint("kick_user_id", { mode: "number", unsigned: true }).notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    source: mysqlEnum("source", ["manual", "chat_badge"]).notNull(),
    grantedByUserId: bigint("granted_by_user_id", { mode: "number", unsigned: true }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    grantedAt: datetime("granted_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    revokedAt: datetime("revoked_at"),
    revokedByUserId: bigint("revoked_by_user_id", { mode: "number", unsigned: true }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [uniqueIndex("moderators_kick_user_id_unique").on(table.kickUserId)],
);
