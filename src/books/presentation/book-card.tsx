import Link from "next/link";
import type { Book } from "@/books/domain/book";
import { LikeButton } from "@/book-likes/presentation/like-button";
import { BookCover } from "./book-cover";
import { BookStatusLabel, bookStatusLabel } from "./book-status-label";
import { formatAuthors } from "./format";

export function BookCard({
  book,
  liked,
  turnstileSiteKey,
  rank,
}: {
  book: Book;
  liked: boolean;
  turnstileSiteKey: string;
  rank?: number;
}) {
  return (
    <article className="group flex flex-col gap-3">
      <Link href={`/libros/${book.id}`} aria-hidden="true" tabIndex={-1} className="relative block">
        <BookCover
          coverId={book.coverId}
          title={book.title}
          className="transition-[translate] duration-200 ease-(--ease-out) motion-safe:group-hover:-translate-y-1"
        />
        {rank !== undefined && (
          <span className="absolute -left-2 -top-2 flex size-8 items-center justify-center rounded-full bg-paper font-serif text-sm font-semibold text-ink-950 tabular-nums">
            {rank}
          </span>
        )}
        {book.status !== "approved" && (
          <BookStatusLabel status={book.status} className="absolute bottom-2 left-2 shadow-sm" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-serif text-lg leading-snug text-paper">
          <Link href={`/libros/${book.id}`} className="underline-offset-4 hover:underline">
            {rank !== undefined && <span className="sr-only">Puesto {rank}: </span>}
            {book.title}
            {book.status !== "approved" && (
              <span className="sr-only"> ({bookStatusLabel(book.status).toLowerCase()})</span>
            )}
          </Link>
        </h3>
        <p className="text-sm text-ink-400">{formatAuthors(book.authors)}</p>
        <p className="text-xs text-ink-500">
          {book.proposer
            ? `Propuesto por @${book.proposer.username}`
            : "Propuesto por la comunidad"}
        </p>
      </div>
      <LikeButton
        bookId={book.id}
        bookTitle={book.title}
        initialLiked={liked}
        initialCount={book.likesCount}
        turnstileSiteKey={turnstileSiteKey}
      />
    </article>
  );
}
