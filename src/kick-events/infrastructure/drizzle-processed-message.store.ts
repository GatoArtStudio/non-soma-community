import "server-only";
import { lt } from "drizzle-orm";
import { isDuplicateKeyError, type Database } from "@/shared/db/client";
import type { ProcessedMessageStore } from "@/kick-events/domain/kick-webhook";
import { processedWebhookMessagesTable } from "./processed-webhook-messages.table";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const PRUNE_PROBABILITY = 0.01;

export class DrizzleProcessedMessageStore implements ProcessedMessageStore {
  constructor(private readonly db: Database) {}

  async markProcessed(messageId: string): Promise<boolean> {
    try {
      await this.db
        .insert(processedWebhookMessagesTable)
        .values({ messageId: messageId.slice(0, 64) });
    } catch (error) {
      if (isDuplicateKeyError(error)) return false;
      throw error;
    }
    if (Math.random() < PRUNE_PROBABILITY) {
      await this.db
        .delete(processedWebhookMessagesTable)
        .where(lt(processedWebhookMessagesTable.receivedAt, new Date(Date.now() - RETENTION_MS)));
    }
    return true;
  }
}
