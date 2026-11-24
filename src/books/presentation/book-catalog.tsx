import Link from "next/link";
import { getViewer } from "@/authentication/presentation/viewer";
import { findLikedBookIds } from "@/book-likes/presentation/liked-books";
import { BOOKS_PAGE_SIZE } from "@/books/application/browse-books";
import { getBrowseBooks } from "@/books/container";
import { getPublicConfig } from "@/shared/config/public-config";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";
import { BookGrid } from "./book-grid";
import {
  CATALOG_FILTERS,
  CATALOG_SORTS,
  catalogHref,
  parseCatalogQuery,
  type SearchParams,
} from "./catalog-query";

export async function BookCatalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = parseCatalogQuery(await searchParams);
  const { turnstileSiteKey } = await getPublicConfig();
  const { books, total } = await getBrowseBooks().browseBooks(query);
  const likedBookIds = await findLikedBookIds(
    await getViewer(),
    books.map((book) => book.id),
  );
  const totalPages = Math.max(1, Math.ceil(total / BOOKS_PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <form action="/libros" className="flex gap-2" role="search">
          {query.filter !== "all" && <input type="hidden" name="filtro" value={query.filter} />}
          {query.sort !== "most_liked" && <input type="hidden" name="orden" value={query.sort} />}
          <input
            type="search"
            name="q"
            defaultValue={query.search}
            maxLength={100}
            placeholder="Buscar por título o autor"
            aria-label="Buscar libros"
            className="w-full max-w-md rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm placeholder:text-ink-500 focus:border-ink-400 focus:outline-none"
          />
          <button type="submit" className={buttonClasses("secondary")}>
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
            {CATALOG_FILTERS.map((option) => (
              <Link
                key={option.value}
                href={catalogHref(query, { filter: option.value, page: 1 })}
                aria-current={query.filter === option.value ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  query.filter === option.value
                    ? "border-paper bg-paper text-ink-950"
                    : "border-ink-700 text-ink-300 hover:border-ink-500 hover:text-paper",
                )}
              >
                {option.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Ordenar" className="flex gap-3 text-sm">
            {CATALOG_SORTS.map((option) => (
              <Link
                key={option.value}
                href={catalogHref(query, { sort: option.value, page: 1 })}
                aria-current={query.sort === option.value ? "page" : undefined}
                className={cn(
                  "underline-offset-4",
                  query.sort === option.value
                    ? "text-paper underline"
                    : "text-ink-400 hover:text-paper",
                )}
              >
                {option.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-700 px-6 py-12 text-center text-ink-400">
          {query.search
            ? `No encontramos libros para «${query.search}».`
            : "Aún no hay libros en esta sección."}
        </p>
      ) : (
        <BookGrid books={books} likedBookIds={likedBookIds} turnstileSiteKey={turnstileSiteKey} />
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-4 text-sm">
          {query.page > 1 && (
            <Link
              href={catalogHref(query, { page: query.page - 1 })}
              className={buttonClasses("secondary")}
            >
              Anterior
            </Link>
          )}
          <span className="text-ink-400">
            Página {query.page} de {totalPages}
          </span>
          {query.page < totalPages && (
            <Link
              href={catalogHref(query, { page: query.page + 1 })}
              className={buttonClasses("secondary")}
            >
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
