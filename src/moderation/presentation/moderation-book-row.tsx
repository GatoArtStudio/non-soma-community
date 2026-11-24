import Link from "next/link";
import type { ReactNode } from "react";
import type { Book } from "@/books/domain/book";
import { ExternalLink } from "@/shared/ui/external-link";
import { BookCover } from "@/books/presentation/book-cover";
import { BookStatusLabel } from "@/books/presentation/book-status-label";
import { formatAuthors, formatDate } from "@/books/presentation/format";

export function ModerationBookRow({ book, actions }: { book: Book; actions: ReactNode }) {
  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-4">
        <BookCover coverId={book.coverId} title={book.title} className="w-14 shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-lg leading-snug">
              {book.status === "pending" || book.status === "rejected" ? (
                book.title
              ) : (
                <Link href={`/libros/${book.id}`} className="hover:underline">
                  {book.title}
                </Link>
              )}
            </p>
            <BookStatusLabel status={book.status} />
          </div>
          <p className="text-sm text-ink-400">
            {formatAuthors(book.authors)}
            {book.firstPublishYear ? ` · ${book.firstPublishYear}` : ""}
          </p>
          <p className="text-xs text-ink-500">
            {book.proposer ? `@${book.proposer.username}` : "Anónimo"} ·{" "}
            {formatDate(book.createdAt)}
            {" · "}
            {book.likesCount} me gusta ·{" "}
            <ExternalLink
              href={`https://openlibrary.org/works/${book.openLibraryWorkKey}`}
              className="underline-offset-4 hover:underline"
            >
              Open Library
            </ExternalLink>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
    </li>
  );
}
