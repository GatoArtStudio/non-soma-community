import { bigint, datetime, mysqlTable, serial, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { booksTable } from "@/books/infrastructure/books.table";

export const bookLikesTable = mysqlTable(
  "book_likes",
  {
    id: serial("id").primaryKey(),
    bookId: bigint("book_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    likerKey: varchar("liker_key", { length: 80 }).notNull(),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("book_likes_liker_unique").on(table.bookId, table.likerKey)],
);
