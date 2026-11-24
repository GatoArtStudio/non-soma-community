import { PUBLISHED_STATUSES, isPublished, type BookStatus } from "@/books/domain/book-status";
import type { Book } from "@/books/domain/book";
import type { BookPage, BookRepository, BookSort } from "@/books/domain/book.repository";

export type CatalogFilter = "all" | "recommended" | "reading" | "read";

const FILTER_STATUSES: Record<CatalogFilter, readonly BookStatus[]> = {
  all: PUBLISHED_STATUSES,
  recommended: ["approved"],
  reading: ["reading"],
  read: ["read"],
};

export const BOOKS_PAGE_SIZE = 24;

export interface BrowseBooksQuery {
  filter: CatalogFilter;
  search?: string;
  sort: BookSort;
  page: number;
}

export function createBrowseBooks(deps: { books: BookRepository }) {
  function browseBooks(query: BrowseBooksQuery): Promise<BookPage> {
    const page = Math.max(1, Math.floor(query.page));
    return deps.books.list({
      statuses: FILTER_STATUSES[query.filter],
      search: query.search?.trim().slice(0, 100) || undefined,
      sort: query.sort,
      limit: BOOKS_PAGE_SIZE,
      offset: (page - 1) * BOOKS_PAGE_SIZE,
    });
  }

  async function topRecommendations(limit: number): Promise<Book[]> {
    const { books } = await deps.books.list({
      statuses: ["approved"],
      sort: "most_liked",
      limit,
      offset: 0,
    });
    return books;
  }

  async function getPublishedBook(id: number): Promise<Book | null> {
    const book = await deps.books.findById(id);
    return book && isPublished(book.status) ? book : null;
  }

  return { browseBooks, topRecommendations, getPublishedBook };
}
