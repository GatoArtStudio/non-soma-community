import Link from "next/link";
import { getViewer } from "@/authentication/presentation/viewer";
import { findLikedBookIds } from "@/book-likes/presentation/liked-books";
import { LikeButton } from "@/book-likes/presentation/like-button";
import { BookCover } from "@/books/presentation/book-cover";
import { formatAuthors, formatDate } from "@/books/presentation/format";
import { getPublicConfig } from "@/shared/config/public-config";
import { buttonClasses } from "@/shared/ui/button";
import { getManageReading } from "@/readings/container";

export async function CurrentReadingHero() {
  const { turnstileSiteKey, kickChannelSlug } = await getPublicConfig();
  const reading = await getManageReading().getCurrentReading();
  const channelUrl = `https://kick.com/${kickChannelSlug}`;

  if (!reading) {
    return (
      <section className="rounded-3xl border border-ink-800 bg-ink-900 px-6 py-12 sm:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-500">Leyendo ahora</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          Estamos eligiendo el próximo libro.
        </h1>
        <p className="mt-4 max-w-xl text-ink-300">
          Propón un título o dale me gusta a tus favoritos: los más votados son los candidatos a la
          próxima lectura en directo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/proponer" className={buttonClasses("primary")}>
            Proponer un libro
          </Link>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary")}
          >
            Ver el canal en Kick
          </a>
        </div>
      </section>
    );
  }

  const { book } = reading;
  const liked = (await findLikedBookIds(await getViewer(), [book.id])).has(book.id);

  return (
    <section className="grid gap-8 rounded-3xl border border-ink-800 bg-ink-900 p-6 sm:grid-cols-[220px_1fr] sm:p-10">
      <BookCover
        coverId={book.coverId}
        title={book.title}
        size="L"
        priority
        className="mx-auto w-44 sm:w-full"
      />
      <div className="flex flex-col justify-center">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400">
          <span
            className="size-2 rounded-full bg-paper motion-safe:animate-pulse"
            aria-hidden="true"
          />
          Leyendo ahora en el stream
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          <Link href={`/libros/${book.id}`} className="hover:underline">
            {book.title}
          </Link>
        </h1>
        <p className="mt-2 text-lg text-ink-300">{formatAuthors(book.authors)}</p>
        <dl className="mt-6 grid max-w-md grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-500">Vamos por</dt>
            <dd className="mt-1 text-paper">{reading.currentChapter ?? "El comienzo"}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Desde</dt>
            <dd className="mt-1 text-paper">{formatDate(reading.startedAt)}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-start gap-3">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary")}
          >
            Ver en Kick
          </a>
          <LikeButton
            bookId={book.id}
            bookTitle={book.title}
            initialLiked={liked}
            initialCount={book.likesCount}
            turnstileSiteKey={turnstileSiteKey}
            size="lg"
          />
        </div>
      </div>
    </section>
  );
}

export function CurrentReadingHeroSkeleton() {
  return <div aria-hidden="true" className="h-80 animate-pulse rounded-3xl bg-ink-900" />;
}
