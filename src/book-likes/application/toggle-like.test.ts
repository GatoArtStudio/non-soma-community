import { describe, expect, it } from "vitest";
import type { LikeRepository } from "@/book-likes/domain/like.repository";
import { likerKey, networkKey, type Liker } from "@/book-likes/domain/liker";
import { allowAllGuard, InMemoryBookRepository } from "@/test/fakes";
import { createToggleLike } from "./toggle-like";

class InMemoryLikeRepository implements LikeRepository {
  likes = new Set<string>();
  networks = new Set<string>();

  constructor(private readonly books: InMemoryBookRepository) {}

  async add(bookId: number, liker: Liker) {
    const key = `${bookId}:${likerKey(liker)}`;
    const network = networkKey(liker);
    const networkEntry = network ? `${bookId}:${network}` : null;
    if (this.likes.has(key) || (networkEntry && this.networks.has(networkEntry))) {
      return "already_liked" as const;
    }
    this.likes.add(key);
    if (networkEntry) this.networks.add(networkEntry);
    const book = await this.books.findById(bookId);
    if (book) book.likesCount += 1;
    return "added" as const;
  }

  async remove(bookId: number, liker: Liker) {
    const removed = this.likes.delete(`${bookId}:${likerKey(liker)}`);
    const network = networkKey(liker);
    if (network) this.networks.delete(`${bookId}:${network}`);
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

const request = { verificationToken: "t", remoteIp: null, networkHash: "net-a" };

describe("toggleLike", () => {
  it("counts one like per account", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("approved");
    const liker: Liker = { kind: "user", userId: 1 };

    await toggleLike({ ...request, bookId: book.id, like: true, liker });
    const second = await toggleLike({ ...request, bookId: book.id, like: true, liker });

    expect(second).toEqual({ liked: true, likesCount: 1 });
  });

  it("counts one anonymous like per network even with new cookies", async () => {
    const { books, toggleLike } = setup();
    const book = books.seed("approved");

    await toggleLike({
      ...request,
      bookId: book.id,
      like: true,
      liker: { kind: "anonymous", visitorHash: "v1", networkHash: "net-a" },
    });
    const result = await toggleLike({
      ...request,
      bookId: book.id,
      like: true,
      liker: { kind: "anonymous", visitorHash: "v2", networkHash: "net-a" },
    });

    expect(result.likesCount).toBe(1);
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
