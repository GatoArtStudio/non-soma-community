import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { isDuplicateKeyError, type Database } from "@/shared/db/client";
import { booksTable } from "@/books/infrastructure/books.table";
import type { BookStatus } from "@/books/domain/book-status";
import type { OpenReading } from "@/readings/domain/reading";
import type { ReadingRepository } from "@/readings/domain/reading.repository";
import { readingsTable } from "./readings.table";

class ConcurrentChangeError extends Error {}

export class DrizzleReadingRepository implements ReadingRepository {
  constructor(private readonly db: Database) {}

  async findOpen(): Promise<OpenReading | null> {
    const [row] = await this.db
      .select({
        id: readingsTable.id,
        bookId: readingsTable.bookId,
        currentChapter: readingsTable.currentChapter,
        startedAt: readingsTable.startedAt,
      })
      .from(readingsTable)
      .where(isNull(readingsTable.finishedAt))
      .limit(1);
    return row ?? null;
  }

  async start(input: {
    bookId: number;
    fromStatus: BookStatus;
    chapter: string | null;
  }): Promise<boolean> {
    try {
      await this.db.transaction(async (tx) => {
        const [update] = await tx
          .update(booksTable)
          .set({ status: "reading", readAt: null })
          .where(and(eq(booksTable.id, input.bookId), eq(booksTable.status, input.fromStatus)));
        if (update.affectedRows !== 1) throw new ConcurrentChangeError();
        await tx
          .insert(readingsTable)
          .values({ bookId: input.bookId, currentChapter: input.chapter });
      });
      return true;
    } catch (error) {
      if (error instanceof ConcurrentChangeError || isDuplicateKeyError(error)) return false;
      throw error;
    }
  }

  async updateChapter(readingId: number, chapter: string | null): Promise<void> {
    await this.db
      .update(readingsTable)
      .set({ currentChapter: chapter })
      .where(eq(readingsTable.id, readingId));
  }

  async finish(reading: OpenReading, at: Date): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(readingsTable)
        .set({ finishedAt: at })
        .where(eq(readingsTable.id, reading.id));
      await tx
        .update(booksTable)
        .set({ status: "read", readAt: at })
        .where(and(eq(booksTable.id, reading.bookId), eq(booksTable.status, "reading")));
    });
  }

  async cancel(reading: OpenReading): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(readingsTable).where(eq(readingsTable.id, reading.id));
      await tx
        .update(booksTable)
        .set({ status: "approved" })
        .where(and(eq(booksTable.id, reading.bookId), eq(booksTable.status, "reading")));
    });
  }
}
