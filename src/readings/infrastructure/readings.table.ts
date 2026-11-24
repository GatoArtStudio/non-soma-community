import {
  bigint,
  datetime,
  index,
  mysqlTable,
  serial,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { booksTable } from "@/books/infrastructure/books.table";

export const readingsTable = mysqlTable(
  "readings",
  {
    id: serial("id").primaryKey(),
    bookId: bigint("book_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    currentChapter: varchar("current_chapter", { length: 120 }),
    startedAt: datetime("started_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    finishedAt: datetime("finished_at"),
    // 1 while the reading is open, NULL afterwards: the unique index allows a single open reading.
    openMarker: tinyint("open_marker").generatedAlwaysAs(
      sql`(case when finished_at is null then 1 else null end)`,
      { mode: "stored" },
    ),
  },
  (table) => [
    uniqueIndex("readings_single_open_unique").on(table.openMarker),
    index("readings_book_id_idx").on(table.bookId),
  ],
);
