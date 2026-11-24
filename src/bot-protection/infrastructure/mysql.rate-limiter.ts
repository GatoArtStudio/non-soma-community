import "server-only";
import { and, eq, lt, sql } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import type { RateLimiter, RateLimitRule } from "@/bot-protection/domain/rate-limiter.port";
import { rateLimitBucketsTable } from "./rate-limit-buckets.table";

const PRUNE_PROBABILITY = 0.01;

/** Fixed-window counter stored in MySQL, shared by every app instance. */
export class MySqlRateLimiter implements RateLimiter {
  constructor(private readonly db: Database) {}

  async consume({ key, limit, windowSeconds }: RateLimitRule): Promise<boolean> {
    const windowMs = windowSeconds * 1000;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

    await this.db
      .insert(rateLimitBucketsTable)
      .values({ bucketKey: key, windowStart, hits: 1 })
      .onDuplicateKeyUpdate({ set: { hits: sql`${rateLimitBucketsTable.hits} + 1` } });

    const [bucket] = await this.db
      .select({ hits: rateLimitBucketsTable.hits })
      .from(rateLimitBucketsTable)
      .where(
        and(
          eq(rateLimitBucketsTable.bucketKey, key),
          eq(rateLimitBucketsTable.windowStart, windowStart),
        ),
      );

    if (Math.random() < PRUNE_PROBABILITY) {
      await this.pruneExpired();
    }

    return (bucket?.hits ?? 1) <= limit;
  }

  private async pruneExpired(): Promise<void> {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await this.db
      .delete(rateLimitBucketsTable)
      .where(lt(rateLimitBucketsTable.windowStart, twoDaysAgo));
  }
}
