import { describe, expect, it } from "vitest";
import type { OpenReading } from "@/readings/domain/reading";
import type { ReadingRepository } from "@/readings/domain/reading.repository";
import { actor, InMemoryBookRepository, RecordingModerationLog } from "@/test/fakes";
import { createManageReading } from "./manage-reading";

class InMemoryReadingRepository implements ReadingRepository {
  open: OpenReading | null = null;

  constructor(private readonly books: InMemoryBookRepository) {}

  async findOpen() {
    return this.open;
  }

  async start(input: {
    bookId: number;
    fromStatus: "approved" | "read" | string;
    chapter: string | null;
  }) {
    if (this.open) return false;
    const book = await this.books.findById(input.bookId);
    if (!book || book.status !== input.fromStatus) return false;
    book.status = "reading";
    this.open = {
      id: 1,
      bookId: input.bookId,
      currentChapter: input.chapter,
      startedAt: new Date(),
    };
    return true;
  }

  async updateChapter(_readingId: number, chapter: string | null) {
    if (this.open) this.open.currentChapter = chapter;
  }

  async finish(reading: OpenReading) {
    const book = await this.books.findById(reading.bookId);
    if (book) book.status = "read";
    this.open = null;
  }

  async cancel(reading: OpenReading) {
    const book = await this.books.findById(reading.bookId);
    if (book) book.status = "approved";
    this.open = null;
  }
}

function setup() {
  const books = new InMemoryBookRepository();
  const readings = new InMemoryReadingRepository(books);
  const manage = createManageReading({ books, readings, log: new RecordingModerationLog() });
  return { books, readings, manage };
}

describe("manageReading", () => {
  it("runs a reading from start to finish", async () => {
    const { books, manage } = setup();
    const book = books.seed("approved");

    await manage.startReading(actor("moderator"), book.id, "  Capítulo 1 ");
    expect((await manage.getCurrentReading())?.currentChapter).toBe("Capítulo 1");

    await manage.updateChapter(actor("moderator"), "Capítulo 2");
    await manage.finishReading(actor("moderator"));

    expect((await books.findById(book.id))?.status).toBe("read");
    expect(await manage.getCurrentReading()).toBeNull();
  });

  it("allows only one open reading", async () => {
    const { books, manage } = setup();
    const first = books.seed("approved");
    const second = books.seed("approved");

    await manage.startReading(actor("moderator"), first.id);
    await expect(manage.startReading(actor("moderator"), second.id)).rejects.toMatchObject({
      code: "reading_in_progress",
    });
  });

  it("cannot read books that were never approved", async () => {
    const { books, manage } = setup();
    const book = books.seed("pending");

    await expect(manage.startReading(actor("moderator"), book.id)).rejects.toMatchObject({
      code: "invalid_status_transition",
    });
  });

  it("returns cancelled readings to the recommendations", async () => {
    const { books, manage } = setup();
    const book = books.seed("approved");

    await manage.startReading(actor("owner"), book.id);
    await manage.cancelReading(actor("owner"));

    expect((await books.findById(book.id))?.status).toBe("approved");
  });
});
