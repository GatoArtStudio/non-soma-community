import { describe, expect, it } from "vitest";
import type { LikeRepository } from "@/book-likes/domain/like.repository";
import { likerKey, type Liker } from "@/book-likes/domain/liker";
import { allowAllGuard, InMemoryBookRepository } from "@/test/fakes";
import { createToggleLike } from "./toggle-like";

class InMemoryLikeRepository implements LikeRepository {
  likes = new Set<string>();

  constructor(private readonly books: InMemoryBookRepository) {}

  async add(bookId: number, liker: Liker) {
    const key = `${bookId}:${likerKey(liker)}`;
    if (this.likes.has(key)) return "already_liked" as const;
    this.likes.add(key);
    const book = await this.books.findById(bookId);
    if (book) book.likesCount += 1;
    return "added" as const;
  }

  async remove(bookId: number, liker: Liker) {
    const removed = this.likes.delete(`${bookId}:${likerKey(liker)}`);
    const book = await this.books.findById(bookId);
    if (removed && book) book.likesCount -= 1;
    return removed;
  }

  async findLikedBookIds() {
    return new Set<number>();
  }
}

function setup() {
  const books = new InMemoryBookRepository();
  const likes = new InMemoryLikeRepository(books);
  const { toggleLike } = createToggleLike({ books, likes, guardHumanAction: allowAllGuard });
  return { books, toggleLike };
}

const request = { verificationToken: "t", remoteIp: null };

describe("toggleLike", () => {
  it("counts one like per account", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("approved");
    const liker: Liker = { kind: "user", userId: 1 };

    await toggleLike({ ...request, bookId: book.id, like: true, liker });
    const second = await toggleLike({ ...request, bookId: book.id, like: true, liker });

    expect(second).toEqual({ liked: true, likesCount: 1 });
  });

  it("counts one like per device and lets each device vote", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("approved");
    const firstDevice: Liker = { kind: "anonymous", visitorHash: "v1" };

    await toggleLike({ ...request, bookId: book.id, like: true, liker: firstDevice });
    await toggleLike({ ...request, bookId: book.id, like: true, liker: firstDevice });
    const result = await toggleLike({
      ...request,
      bookId: book.id,
      like: true,
      liker: { kind: "anonymous", visitorHash: "v2" },
    });

    expect(result.likesCount).toBe(2);
  });

  it("removes likes", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("read");
    const liker: Liker = { kind: "user", userId: 1 };

    await toggleLike({ ...request, bookId: book.id, like: true, liker });
    const result = await toggleLike({ ...request, bookId: book.id, like: false, liker });

    expect(result).toEqual({ liked: false, likesCount: 0 });
  });

  it("does not allow liking unpublished books", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("pending");

    await expect(
      toggleLike({ ...request, bookId: book.id, like: true, liker: { kind: "user", userId: 1 } }),
    ).rejects.toMatchObject({ code: "book_not_found" });
  });
});
