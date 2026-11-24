import type { BookStatus } from "@/books/domain/book-status";
import type { OpenReading } from "./reading";

export interface ReadingRepository {
  findOpen(): Promise<OpenReading | null>;
  /**
   * Opens a reading and moves the book to "reading" in one transaction. Returns false when
   * the book is no longer in `fromStatus` or another reading was opened concurrently.
   */
  start(input: {
    bookId: number;
    fromStatus: BookStatus;
    chapter: string | null;
  }): Promise<boolean>;
  updateChapter(readingId: number, chapter: string | null): Promise<void>;
  /** Closes the reading and marks the book as read. */
  finish(reading: OpenReading, at: Date): Promise<void>;
  /** Discards the reading and returns the book to the recommendations. */
  cancel(reading: OpenReading): Promise<void>;
}
