import { DomainError } from "@/shared/errors/domain-error";
import type { RateLimiter } from "@/bot-protection/domain/rate-limiter.port";
import { rateLimitPolicies } from "@/bot-protection/domain/rate-limit-policies";
import type { CatalogEntry } from "@/books/domain/book";
import type { BookCatalog } from "@/books/domain/book-catalog.port";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const RESULT_LIMIT = 10;

export function createSearchCatalog(deps: { catalog: BookCatalog; limiter: RateLimiter }) {
  return async function searchCatalog(input: {
    query: string;
    networkHash: string;
  }): Promise<CatalogEntry[]> {
    const query = input.query.trim().slice(0, MAX_QUERY_LENGTH);
    if (query.length < MIN_QUERY_LENGTH) return [];
    if (
      !(await deps.limiter.consume(rateLimitPolicies.catalogSearchesPerNetwork(input.networkHash)))
    ) {
      throw new DomainError("rate_limited");
    }
    return deps.catalog.search(query, RESULT_LIMIT);
  };
}
