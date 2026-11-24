import { datetime, int, mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";

export const rateLimitBucketsTable = mysqlTable(
  "rate_limit_buckets",
  {
    bucketKey: varchar("bucket_key", { length: 160 }).notNull(),
    windowStart: datetime("window_start").notNull(),
    hits: int("hits", { unsigned: true }).notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.bucketKey, table.windowStart] })],
);
