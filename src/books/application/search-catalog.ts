import type { CatalogEntry } from "@/books/domain/book";
import type { BookCatalog } from "@/books/domain/book-catalog.port";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const RESULT_LIMIT = 10;

/** Request volume is throttled per IP in the proxy, before it reaches this use case. */
export function createSearchCatalog(deps: { catalog: BookCatalog }) {
  return async function searchCatalog(rawQuery: string): Promise<CatalogEntry[]> {
    const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
    if (query.length < MIN_QUERY_LENGTH) return [];
    return deps.catalog.search(query, RESULT_LIMIT);
  };
}
