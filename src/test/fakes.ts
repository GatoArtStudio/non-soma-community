import type { Book, CatalogEntry } from "@/books/domain/book";
import type { BookCatalog } from "@/books/domain/book-catalog.port";
import type { BookStatus } from "@/books/domain/book-status";
import type { BookListQuery, BookRepository, NewBook } from "@/books/domain/book.repository";
import type { ModerationActionEntry } from "@/moderation/domain/moderation-action";
import type { ModerationLog } from "@/moderation/domain/moderation-log.port";
import type { KickChannelDirectory } from "@/moderators/domain/kick-channel.port";
import type { Moderator } from "@/moderators/domain/moderator";
import type { ModeratorRepository } from "@/moderators/domain/moderator.repository";
import type { Actor } from "@/moderators/domain/staff-member";

export const BROADCASTER_ID = 1000;

export function catalogEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return {
    workKey: "OL274505W",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
    coverId: 12627383,
    firstPublishYear: 1967,
    ...overrides,
  };
}

export class InMemoryBookRepository implements BookRepository {
  books: Book[] = [];
  private nextId = 1;

  seed(status: BookStatus, overrides: Partial<Book> = {}): Book {
    const book: Book = {
      id: this.nextId++,
      openLibraryWorkKey: `OL${this.nextId}W`,
      title: "Libro",
      authors: [],
      coverId: null,
      firstPublishYear: null,
      status,
      proposer: null,
      likesCount: 0,
      createdAt: new Date(),
      reviewedAt: null,
      readAt: null,
      ...overrides,
    };
    this.books.push(book);
    return book;
  }

  async findById(id: number) {
    return this.books.find((book) => book.id === id) ?? null;
  }

  async findByWorkKey(workKey: string) {
    return this.books.find((book) => book.openLibraryWorkKey === workKey) ?? null;
  }

  async list(query: BookListQuery) {
    const books = this.books.filter((book) => query.statuses.includes(book.status));
    return { books: books.slice(query.offset, query.offset + query.limit), total: books.length };
  }

  async create({ entry, status, proposerUserId }: NewBook) {
    if (await this.findByWorkKey(entry.workKey)) return null;
    return this.seed(status, {
      openLibraryWorkKey: entry.workKey,
      title: entry.title,
      authors: entry.authors,
      coverId: entry.coverId,
      firstPublishYear: entry.firstPublishYear,
      proposer: proposerUserId ? { userId: proposerUserId, username: "lector" } : null,
    });
  }

  async updateStatus(id: number, from: BookStatus, to: BookStatus, at: Date) {
    const book = this.books.find((candidate) => candidate.id === id);
    if (!book || book.status !== from) return false;
    book.status = to;
    if (to === "read") book.readAt = at;
    return true;
  }

  async delete(id: number) {
    this.books = this.books.filter((book) => book.id !== id);
  }
}

export class FakeCatalog implements BookCatalog {
  constructor(private readonly entries: CatalogEntry[] = [catalogEntry()]) {}

  async search() {
    return this.entries;
  }

  async findByWorkKey(workKey: string) {
    return this.entries.find((entry) => entry.workKey === workKey) ?? null;
  }
}

export class RecordingModerationLog implements ModerationLog {
  entries: ModerationActionEntry[] = [];

  async record(entry: ModerationActionEntry) {
    this.entries.push(entry);
  }

  async listRecent() {
    return [];
  }
}

export class InMemoryModeratorRepository implements ModeratorRepository {
  moderators = new Map<number, Moderator>();

  async findByKickUserId(kickUserId: number) {
    return this.moderators.get(kickUserId) ?? null;
  }

  async list() {
    return [...this.moderators.values()];
  }

  async grant(input: Parameters<ModeratorRepository["grant"]>[0]) {
    this.moderators.set(input.kickUserId, {
      kickUserId: input.kickUserId,
      username: input.username,
      source: input.source,
      grantedAt: new Date(),
      revokedAt: null,
    });
  }

  async updateUsername(kickUserId: number, username: string) {
    const moderator = this.moderators.get(kickUserId);
    if (moderator) moderator.username = username;
  }

  async revoke(kickUserId: number) {
    const moderator = this.moderators.get(kickUserId);
    if (moderator) moderator.revokedAt = new Date();
  }
}

export class FakeChannelDirectory implements KickChannelDirectory {
  async getBroadcasterUserId() {
    return BROADCASTER_ID;
  }

  async findAccountBySlug(slug: string) {
    return slug === "elmune" ? { kickUserId: BROADCASTER_ID, username: "elmune" } : null;
  }
}

export const allowAllGuard = async () => undefined;

export function actor(role: Actor["role"], overrides: Partial<Actor> = {}): Actor {
  return { userId: 1, kickUserId: 42, username: "mod", role, ...overrides };
}
