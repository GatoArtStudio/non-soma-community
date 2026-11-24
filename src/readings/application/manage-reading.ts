import { DomainError } from "@/shared/errors/domain-error";
import { assertTransition } from "@/books/domain/book-status";
import type { BookRepository } from "@/books/domain/book.repository";
import type { ModerationLog } from "@/moderation/domain/moderation-log.port";
import { assertCanModerate, type Actor } from "@/moderators/domain/staff-member";
import { normalizeChapter, type CurrentReading, type OpenReading } from "@/readings/domain/reading";
import type { ReadingRepository } from "@/readings/domain/reading.repository";

export type ReadingErrorCode =
  "book_not_found" | "reading_in_progress" | "no_reading_in_progress" | "book_changed_concurrently";

export function createManageReading(deps: {
  readings: ReadingRepository;
  books: BookRepository;
  log: ModerationLog;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());

  async function requireOpenReading(): Promise<OpenReading> {
    const reading = await deps.readings.findOpen();
    if (!reading) throw new DomainError<ReadingErrorCode>("no_reading_in_progress");
    return reading;
  }

  async function getCurrentReading(): Promise<CurrentReading | null> {
    const reading = await deps.readings.findOpen();
    if (!reading) return null;
    const book = await deps.books.findById(reading.bookId);
    return book ? { ...reading, book } : null;
  }

  async function startReading(actor: Actor, bookId: number, chapter?: string): Promise<void> {
    assertCanModerate(actor);
    const book = await deps.books.findById(bookId);
    if (!book) throw new DomainError<ReadingErrorCode>("book_not_found");
    assertTransition(book.status, "reading");
    if (await deps.readings.findOpen()) {
      throw new DomainError<ReadingErrorCode>("reading_in_progress");
    }
    const started = await deps.readings.start({
      bookId: book.id,
      fromStatus: book.status,
      chapter: normalizeChapter(chapter),
    });
    if (!started) throw new DomainError<ReadingErrorCode>("book_changed_concurrently");
    await deps.log.record({
      actorUserId: actor.userId,
      action: "start_reading",
      bookId: book.id,
      bookTitle: book.title,
    });
  }

  async function updateChapter(actor: Actor, chapter: string): Promise<void> {
    assertCanModerate(actor);
    const reading = await requireOpenReading();
    const normalized = normalizeChapter(chapter);
    await deps.readings.updateChapter(reading.id, normalized);
    await deps.log.record({
      actorUserId: actor.userId,
      action: "update_chapter",
      bookId: reading.bookId,
      detail: normalized,
    });
  }

  async function finishReading(actor: Actor): Promise<void> {
    assertCanModerate(actor);
    const reading = await requireOpenReading();
    await deps.readings.finish(reading, now());
    await deps.log.record({
      actorUserId: actor.userId,
      action: "finish_reading",
      bookId: reading.bookId,
    });
  }

  async function cancelReading(actor: Actor): Promise<void> {
    assertCanModerate(actor);
    const reading = await requireOpenReading();
    await deps.readings.cancel(reading);
    await deps.log.record({
      actorUserId: actor.userId,
      action: "cancel_reading",
      bookId: reading.bookId,
    });
  }

  return { getCurrentReading, startReading, updateChapter, finishReading, cancelReading };
}
