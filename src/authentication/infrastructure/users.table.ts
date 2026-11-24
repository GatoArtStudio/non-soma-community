import { bigint, datetime, mysqlTable, serial, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const usersTable = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    kickUserId: bigint("kick_user_id", { mode: "number", unsigned: true }).notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 512 }),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("users_kick_user_id_unique").on(table.kickUserId)],
);
