import { describe, expect, it } from "vitest";
import { actor, InMemoryBookRepository, RecordingModerationLog } from "@/test/fakes";
import { createReviewBooks } from "./review-books";

function setup() {
  const books = new InMemoryBookRepository();
  const log = new RecordingModerationLog();
  return { books, log, review: createReviewBooks({ books, log }) };
}

describe("reviewBooks", () => {
  it("lets moderators approve pending proposals and records it", async () => {
    const { books, log, review } = setup();
    const book = books.seed("pending");

    await review.approveBook(actor("moderator"), book.id);

    expect((await books.findById(book.id))?.status).toBe("approved");
    expect(log.entries).toMatchObject([{ action: "approve_book", bookId: book.id }]);
  });

  it("refuses members", async () => {
    const { books, review } = setup();
    const book = books.seed("pending");

    await expect(review.approveBook(actor("member"), book.id)).rejects.toMatchObject({
      code: "not_moderator",
    });
  });

  it("marks approved books as read and back", async () => {
    const { books, review } = setup();
    const book = books.seed("approved");

    await review.markBookRead(actor("owner"), book.id);
    expect((await books.findById(book.id))?.status).toBe("read");
    await review.markBookUnread(actor("owner"), book.id);
    expect((await books.findById(book.id))?.status).toBe("approved");
  });

  it("sends the current reading through the reading flow", async () => {
    const { books, review } = setup();
    const book = books.seed("reading");

    await expect(review.markBookRead(actor("moderator"), book.id)).rejects.toMatchObject({
      code: "use_reading_flow",
    });
  });

  it("deletes published books with a reason in the log", async () => {
    const { books, log, review } = setup();
    const book = books.seed("approved", { title: "Spam" });

    await review.deleteBook(actor("moderator"), book.id, "  contenido falso ");

    expect(await books.findById(book.id)).toBeNull();
    expect(log.entries[0]).toMatchObject({ action: "delete_book", detail: "contenido falso" });
  });
});
