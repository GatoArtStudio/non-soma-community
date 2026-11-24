import "server-only";
import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { isDuplicateKeyError, type Database } from "@/shared/db/client";
import { usersTable } from "@/authentication/infrastructure/users.table";
import type { Book } from "@/books/domain/book";
import type { BookStatus } from "@/books/domain/book-status";
import type {
  BookListQuery,
  BookPage,
  BookRepository,
  NewBook,
} from "@/books/domain/book.repository";
import { booksTable } from "./books.table";

const bookColumns = {
  id: booksTable.id,
  openLibraryWorkKey: booksTable.openLibraryWorkKey,
  title: booksTable.title,
  authors: booksTable.authors,
  coverId: booksTable.coverId,
  firstPublishYear: booksTable.firstPublishYear,
  status: booksTable.status,
  proposerUserId: booksTable.proposerUserId,
  proposerUsername: usersTable.username,
  likesCount: booksTable.likesCount,
  createdAt: booksTable.createdAt,
  reviewedAt: booksTable.reviewedAt,
  readAt: booksTable.readAt,
};

function selectBooks(db: Database) {
  return db
    .select(bookColumns)
    .from(booksTable)
    .leftJoin(usersTable, eq(usersTable.id, booksTable.proposerUserId));
}

type BookRow = Awaited<ReturnType<typeof selectBooks>>[number];

export function serializeAuthors(authors: string[]): string {
  return JSON.stringify(authors).slice(0, 500);
}

export function parseAuthors(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toBook(row: BookRow): Book {
  return {
    id: row.id,
    openLibraryWorkKey: row.openLibraryWorkKey,
    title: row.title,
    authors: parseAuthors(row.authors),
    coverId: row.coverId,
    firstPublishYear: row.firstPublishYear,
    status: row.status,
    proposer:
      row.proposerUserId !== null && row.proposerUsername !== null
        ? { userId: row.proposerUserId, username: row.proposerUsername }
        : null,
    likesCount: row.likesCount,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    readAt: row.readAt,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export class DrizzleBookRepository implements BookRepository {
  constructor(private readonly db: Database) {}

  async findById(id: number): Promise<Book | null> {
    const [row] = await selectBooks(this.db).where(eq(booksTable.id, id)).limit(1);
    return row ? toBook(row) : null;
  }

  async findByWorkKey(workKey: string): Promise<Book | null> {
    const [row] = await selectBooks(this.db)
      .where(eq(booksTable.openLibraryWorkKey, workKey))
      .limit(1);
    return row ? toBook(row) : null;
  }

  async list(query: BookListQuery): Promise<BookPage> {
    const pattern = query.search ? `%${escapeLike(query.search)}%` : null;
    const where = and(
      inArray(booksTable.status, [...query.statuses]),
      pattern ? or(like(booksTable.title, pattern), like(booksTable.authors, pattern)) : undefined,
    );
    const ordering =
      query.sort === "most_liked"
        ? [desc(booksTable.likesCount), asc(booksTable.createdAt)]
        : [desc(booksTable.createdAt)];

    const [rows, [totals]] = await Promise.all([
      selectBooks(this.db)
        .where(where)
        .orderBy(...ordering)
        .limit(query.limit)
        .offset(query.offset),
      this.db.select({ total: count() }).from(booksTable).where(where),
    ]);
    return { books: rows.map(toBook), total: totals?.total ?? 0 };
  }

  async create({ entry, status, proposerUserId }: NewBook): Promise<Book | null> {
    const now = new Date();
    try {
      await this.db.insert(booksTable).values({
        openLibraryWorkKey: entry.workKey,
        title: entry.title,
        authors: serializeAuthors(entry.authors),
        coverId: entry.coverId,
        firstPublishYear: entry.firstPublishYear,
        status,
        proposerUserId,
        createdAt: now,
        reviewedAt: status === "pending" ? null : now,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) return null;
      throw error;
    }
    return this.findByWorkKey(entry.workKey);
  }

  async updateStatus(id: number, from: BookStatus, to: BookStatus, at: Date): Promise<boolean> {
    const [result] = await this.db
      .update(booksTable)
      .set({
        status: to,
        ...(from === "pending" || from === "rejected" ? { reviewedAt: at } : {}),
        ...(to === "read" ? { readAt: at } : {}),
        ...(from === "read" ? { readAt: null } : {}),
      })
      .where(and(eq(booksTable.id, id), eq(booksTable.status, from)));
    return result.affectedRows === 1;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(booksTable).where(eq(booksTable.id, id));
  }
}
