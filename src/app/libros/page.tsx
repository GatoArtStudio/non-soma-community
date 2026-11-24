import type { Metadata } from "next";
import { Suspense } from "react";
import { BookCatalog } from "@/books/presentation/book-catalog";
import { BookGridSkeleton } from "@/books/presentation/book-grid";

export const metadata: Metadata = {
  title: "Libros",
  description: "Todos los libros propuestos, recomendados y leídos por la comunidad Non Soma.",
};

export default function BooksPage({ searchParams }: PageProps<"/libros">) {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl">Libros</h1>
        <p className="mt-2 text-ink-400">
          Lo que la comunidad propone, lo que estamos leyendo y todo lo que ya leímos juntos.
        </p>
      </header>
      <Suspense fallback={<BookGridSkeleton count={15} />}>
        <BookCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
