import "server-only";
import { z } from "zod";
import type { CatalogEntry } from "@/books/domain/book";
import type { BookCatalog } from "@/books/domain/book-catalog.port";

const SEARCH_URL = "https://openlibrary.org/search.json";
const FIELDS = "key,title,author_name,cover_i,first_publish_year";

const searchResponseSchema = z.object({
  docs: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      author_name: z.array(z.string()).optional(),
      cover_i: z.number().optional(),
      first_publish_year: z.number().optional(),
    }),
  ),
});

type SearchDoc = z.infer<typeof searchResponseSchema>["docs"][number];

export class OpenLibraryCatalog implements BookCatalog {
  constructor(private readonly userAgent: string) {}

  async search(query: string, limit: number): Promise<CatalogEntry[]> {
    const docs = await this.query({ q: query, limit: String(limit) });
    return docs.flatMap((doc) => {
      const entry = toCatalogEntry(doc);
      return entry ? [entry] : [];
    });
  }

  async findByWorkKey(workKey: string): Promise<CatalogEntry | null> {
    const docs = await this.query({ q: `key:/works/${workKey}`, limit: "1" });
    const entry = docs[0] ? toCatalogEntry(docs[0]) : null;
    return entry?.workKey === workKey ? entry : null;
  }

  private async query(params: Record<string, string>): Promise<SearchDoc[]> {
    const url = new URL(SEARCH_URL);
    url.search = new URLSearchParams({ ...params, fields: FIELDS }).toString();
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Open Library search failed with ${response.status}`);
    return searchResponseSchema.parse(await response.json()).docs;
  }
}

function toCatalogEntry(doc: SearchDoc): CatalogEntry | null {
  const workKey = doc.key.replace(/^\/works\//, "");
  if (!/^OL\d+W$/.test(workKey)) return null;
  return {
    workKey,
    title: doc.title.slice(0, 300),
    authors: (doc.author_name ?? []).slice(0, 5),
    coverId: doc.cover_i ?? null,
    firstPublishYear: doc.first_publish_year ?? null,
  };
}
