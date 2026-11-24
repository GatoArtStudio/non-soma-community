import { Suspense } from "react";
import { BookDetail } from "@/books/presentation/book-detail";

export default function BookPage({ params }: PageProps<"/libros/[id]">) {
  return (
    <Suspense
      fallback={<div aria-hidden="true" className="h-96 animate-pulse rounded-3xl bg-ink-900" />}
    >
      <BookDetail params={params} />
    </Suspense>
  );
}
