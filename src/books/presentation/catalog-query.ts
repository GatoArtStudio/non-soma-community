import type { BrowseBooksQuery, CatalogFilter } from "@/books/application/browse-books";
import type { BookSort } from "@/books/domain/book.repository";

export type SearchParams = Record<string, string | string[] | undefined>;

export const CATALOG_FILTERS: { value: CatalogFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "recommended", label: "Recomendados" },
  { value: "reading", label: "Leyendo ahora" },
  { value: "read", label: "Leídos" },
];

export const CATALOG_SORTS: { value: BookSort; label: string }[] = [
  { value: "most_liked", label: "Más votados" },
  { value: "newest", label: "Más recientes" },
];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCatalogQuery(params: SearchParams): BrowseBooksQuery {
  const filter = single(params.filtro);
  const sort = single(params.orden);
  const page = Number.parseInt(single(params.pagina) ?? "1", 10);
  return {
    filter: CATALOG_FILTERS.some((option) => option.value === filter)
      ? (filter as CatalogFilter)
      : "all",
    sort: CATALOG_SORTS.some((option) => option.value === sort) ? (sort as BookSort) : "most_liked",
    search: single(params.q)?.slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  };
}

export function catalogHref(query: BrowseBooksQuery, changes: Partial<BrowseBooksQuery>): string {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.filter !== "all") params.set("filtro", next.filter);
  if (next.sort !== "most_liked") params.set("orden", next.sort);
  if (next.search) params.set("q", next.search);
  if (next.page > 1) params.set("pagina", String(next.page));
  const search = params.toString();
  return search ? `/libros?${search}` : "/libros";
}
