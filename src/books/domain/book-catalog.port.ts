import type { CatalogEntry } from "./book";

export interface BookCatalog {
  search(query: string, limit: number): Promise<CatalogEntry[]>;
  findByWorkKey(workKey: string): Promise<CatalogEntry | null>;
}
