import Link from "next/link";
import type { Book } from "@/books/domain/book";
import { LikeButton } from "@/book-likes/presentation/like-button";
import { BookCover } from "./book-cover";
import { BookStatusLabel } from "./book-status-label";
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
      <Link href={`/libros/${book.id}`} className="relative block">
        <BookCover
          coverId={book.coverId}
          title={book.title}
          className="transition-transform duration-300 group-hover:-translate-y-1"
        />
        {rank !== undefined && (
          <span className="absolute -left-2 -top-2 flex size-8 items-center justify-center rounded-full bg-paper font-serif text-sm font-semibold text-ink-950">
            {rank}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        {book.status !== "approved" && (
          <BookStatusLabel status={book.status} className="self-start" />
        )}
        <h3 className="font-serif text-lg leading-snug text-paper">
          <Link href={`/libros/${book.id}`} className="hover:underline">
            {book.title}
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
