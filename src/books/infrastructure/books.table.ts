import {
  bigint,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  smallint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { usersTable } from "@/authentication/infrastructure/users.table";
import { BOOK_STATUSES } from "@/books/domain/book-status";

export const booksTable = mysqlTable(
  "books",
  {
    id: serial("id").primaryKey(),
    openLibraryWorkKey: varchar("open_library_work_key", { length: 32 }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    authors: varchar("authors", { length: 500 }).notNull(),
    coverId: int("cover_id", { unsigned: true }),
    firstPublishYear: smallint("first_publish_year"),
    status: mysqlEnum("status", BOOK_STATUSES).notNull().default("pending"),
    proposerUserId: bigint("proposer_user_id", { mode: "number", unsigned: true }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    likesCount: int("likes_count", { unsigned: true }).notNull().default(0),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    reviewedAt: datetime("reviewed_at"),
    readAt: datetime("read_at"),
  },
  (table) => [
    uniqueIndex("books_work_key_unique").on(table.openLibraryWorkKey),
    index("books_status_likes_idx").on(table.status, table.likesCount),
    index("books_status_created_idx").on(table.status, table.createdAt),
  ],
);
