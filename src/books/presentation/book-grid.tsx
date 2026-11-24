import type { Book } from "@/books/domain/book";
import { BookCard } from "./book-card";

export function BookGrid({
  books,
  likedBookIds,
  turnstileSiteKey,
  ranked,
}: {
  books: Book[];
  likedBookIds: Set<number>;
  turnstileSiteKey: string;
  ranked?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book, index) => (
        <li key={book.id}>
          <BookCard
            book={book}
            liked={likedBookIds.has(book.id)}
            turnstileSiteKey={turnstileSiteKey}
            rank={ranked ? index + 1 : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <div className="aspect-[2/3] animate-pulse rounded-md bg-ink-850" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-ink-850" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-ink-850" />
        </li>
      ))}
    </ul>
  );
}
