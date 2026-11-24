import "server-only";
import { getEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/client";
import { getGuardHumanAction } from "@/bot-protection/container";
import { createBrowseBooks } from "./application/browse-books";
import { createProposeBook } from "./application/propose-book";
import { createSearchCatalog } from "./application/search-catalog";
import { DrizzleBookRepository } from "./infrastructure/drizzle-book.repository";
import { OpenLibraryCatalog } from "./infrastructure/open-library.catalog";

export function getBookRepository() {
  return new DrizzleBookRepository(getDb());
}

function getCatalog() {
  return new OpenLibraryCatalog(`NonSomaCommunity/1.0 (+${getEnv().APP_URL})`);
}

export function getBrowseBooks() {
  return createBrowseBooks({ books: getBookRepository() });
}

export function getProposeBook() {
  return createProposeBook({
    books: getBookRepository(),
    catalog: getCatalog(),
    guardHumanAction: getGuardHumanAction(),
  });
}

export function getSearchCatalog() {
  return createSearchCatalog({ catalog: getCatalog() });
}
