import "server-only";
import { eq, lt } from "drizzle-orm";
import { isDuplicateKeyError, type Database } from "@/shared/db/client";
import type { ProcessedMessageStore } from "@/kick-events/domain/kick-webhook";
import { processedWebhookMessagesTable } from "./processed-webhook-messages.table";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const PRUNE_PROBABILITY = 0.01;

export class DrizzleProcessedMessageStore implements ProcessedMessageStore {
  constructor(private readonly db: Database) {}

  async wasProcessed(messageId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ messageId: processedWebhookMessagesTable.messageId })
      .from(processedWebhookMessagesTable)
      .where(eq(processedWebhookMessagesTable.messageId, messageId.slice(0, 64)))
      .limit(1);
    return row !== undefined;
  }

  async markProcessed(messageId: string): Promise<void> {
    try {
      await this.db
        .insert(processedWebhookMessagesTable)
        .values({ messageId: messageId.slice(0, 64) });
    } catch (error) {
      if (isDuplicateKeyError(error)) return;
      throw error;
    }
    if (Math.random() < PRUNE_PROBABILITY) {
      await this.db
        .delete(processedWebhookMessagesTable)
        .where(lt(processedWebhookMessagesTable.receivedAt, new Date(Date.now() - RETENTION_MS)));
    }
  }
}
