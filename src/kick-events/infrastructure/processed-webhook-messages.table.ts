import { datetime, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const processedWebhookMessagesTable = mysqlTable("processed_webhook_messages", {
  messageId: varchar("message_id", { length: 64 }).primaryKey(),
  receivedAt: datetime("received_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
