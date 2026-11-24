import type { Book, CatalogEntry } from "./book";
import type { BookStatus } from "./book-status";

export type BookSort = "most_liked" | "newest";

export interface BookListQuery {
  statuses: readonly BookStatus[];
  search?: string;
  sort: BookSort;
  limit: number;
  offset: number;
}

export interface BookPage {
  books: Book[];
  total: number;
}

export interface NewBook {
  entry: CatalogEntry;
  status: BookStatus;
  proposerUserId: number | null;
}

export interface BookRepository {
  findById(id: number): Promise<Book | null>;
  findByWorkKey(workKey: string): Promise<Book | null>;
  list(query: BookListQuery): Promise<BookPage>;
  /** Returns null when another book with the same work key was inserted concurrently. */
  create(book: NewBook): Promise<Book | null>;
  /** Compare-and-set on status so concurrent moderators cannot apply conflicting transitions. */
  updateStatus(id: number, from: BookStatus, to: BookStatus, at: Date): Promise<boolean>;
  delete(id: number): Promise<void>;
}
