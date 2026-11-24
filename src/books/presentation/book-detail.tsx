import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewer } from "@/authentication/presentation/viewer";
import { findLikedBookIds } from "@/book-likes/presentation/liked-books";
import { LikeButton } from "@/book-likes/presentation/like-button";
import { getBrowseBooks } from "@/books/container";
import { getPublicConfig } from "@/shared/config/public-config";
import { ExternalLink } from "@/shared/ui/external-link";
import { BookCover } from "./book-cover";
import { BookStatusLabel } from "./book-status-label";
import { formatAuthors, formatDate } from "./format";

export async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const { turnstileSiteKey } = await getPublicConfig();
  const book = await getBrowseBooks().getPublishedBook(id);
  if (!book) notFound();
  const liked = (await findLikedBookIds(await getViewer(), [book.id])).has(book.id);

  return (
    <article className="grid gap-10 sm:grid-cols-[260px_1fr]">
      <BookCover
        coverId={book.coverId}
        title={book.title}
        size="L"
        priority
        className="mx-auto w-52 sm:w-full"
      />
      <div className="flex flex-col gap-5">
        <BookStatusLabel status={book.status} className="self-start" />
        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-lg text-ink-300">{formatAuthors(book.authors)}</p>
        </div>
        <dl className="grid max-w-lg grid-cols-2 gap-4 text-sm">
          {book.firstPublishYear && (
            <div>
              <dt className="text-ink-500">Primera publicación</dt>
              <dd className="mt-1">{book.firstPublishYear}</dd>
            </div>
          )}
          <div>
            <dt className="text-ink-500">Propuesto por</dt>
            <dd className="mt-1">
              {book.proposer ? `@${book.proposer.username}` : "La comunidad"}
            </dd>
          </div>
          {book.readAt && (
            <div>
              <dt className="text-ink-500">Terminamos de leerlo</dt>
              <dd className="mt-1">{formatDate(book.readAt)}</dd>
            </div>
          )}
        </dl>
        <LikeButton
          bookId={book.id}
          bookTitle={book.title}
          initialLiked={liked}
          initialCount={book.likesCount}
          turnstileSiteKey={turnstileSiteKey}
          size="lg"
        />
        <p className="text-sm text-ink-500">
          Ficha bibliográfica en{" "}
          <ExternalLink
            href={`https://openlibrary.org/works/${book.openLibraryWorkKey}`}
            className="text-ink-300 underline-offset-4 hover:underline"
          >
            Open Library
          </ExternalLink>
          .{" "}
          <Link href="/libros" className="text-ink-300 underline-offset-4 hover:underline">
            Volver a los libros
          </Link>
        </p>
      </div>
    </article>
  );
}
