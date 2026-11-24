import { DomainError } from "@/shared/errors/domain-error";
import type { Book } from "@/books/domain/book";
import { assertTransition, type BookStatus } from "@/books/domain/book-status";
import type { BookRepository } from "@/books/domain/book.repository";
import type { ModerationActionType } from "@/moderation/domain/moderation-action";
import type { ModerationLog } from "@/moderation/domain/moderation-log.port";
import { assertCanModerate, type Actor } from "@/moderators/domain/staff-member";

export type ReviewErrorCode = "book_not_found" | "book_changed_concurrently" | "use_reading_flow";

const MAX_REASON_LENGTH = 300;

export function createReviewBooks(deps: {
  books: BookRepository;
  log: ModerationLog;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());

  async function loadBook(bookId: number): Promise<Book> {
    const book = await deps.books.findById(bookId);
    if (!book) throw new DomainError<ReviewErrorCode>("book_not_found");
    return book;
  }

  async function transition(
    actor: Actor,
    bookId: number,
    to: BookStatus,
    action: ModerationActionType,
    reason?: string,
  ): Promise<void> {
    assertCanModerate(actor);
    const book = await loadBook(bookId);
    if (book.status === "reading") {
      throw new DomainError<ReviewErrorCode>("use_reading_flow");
    }
    assertTransition(book.status, to);
    const updated = await deps.books.updateStatus(book.id, book.status, to, now());
    if (!updated) throw new DomainError<ReviewErrorCode>("book_changed_concurrently");
    await deps.log.record({
      actorUserId: actor.userId,
      action,
      bookId: book.id,
      bookTitle: book.title,
      detail: reason?.trim().slice(0, MAX_REASON_LENGTH) || null,
    });
  }

  return {
    approveBook: (actor: Actor, bookId: number) =>
      transition(actor, bookId, "approved", "approve_book"),
    rejectBook: (actor: Actor, bookId: number, reason?: string) =>
      transition(actor, bookId, "rejected", "reject_book", reason),
    restoreBook: (actor: Actor, bookId: number) =>
      transition(actor, bookId, "approved", "restore_book"),
    markBookRead: (actor: Actor, bookId: number) => transition(actor, bookId, "read", "mark_read"),
    markBookUnread: (actor: Actor, bookId: number) =>
      transition(actor, bookId, "approved", "mark_unread"),

    async deleteBook(actor: Actor, bookId: number, reason?: string): Promise<void> {
      assertCanModerate(actor);
      const book = await loadBook(bookId);
      await deps.books.delete(book.id);
      await deps.log.record({
        actorUserId: actor.userId,
        action: "delete_book",
        bookId: book.id,
        bookTitle: book.title,
        detail: reason?.trim().slice(0, MAX_REASON_LENGTH) || null,
      });
    },

    async listBooksByStatus(actor: Actor, statuses: readonly BookStatus[], page = 1) {
      assertCanModerate(actor);
      const limit = 50;
      return deps.books.list({
        statuses,
        sort: "newest",
        limit,
        offset: (Math.max(1, page) - 1) * limit,
      });
    },

    async listRecentActions(actor: Actor, limit = 30) {
      assertCanModerate(actor);
      return deps.log.listRecent(limit);
    },
  };
}
