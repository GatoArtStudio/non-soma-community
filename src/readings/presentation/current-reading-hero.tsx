import Link from "next/link";
import { getViewer } from "@/authentication/presentation/viewer";
import { findLikedBookIds } from "@/book-likes/presentation/liked-books";
import { LikeButton } from "@/book-likes/presentation/like-button";
import { BookCover } from "@/books/presentation/book-cover";
import { formatAuthors, formatDate } from "@/books/presentation/format";
import { getPublicConfig } from "@/shared/config/public-config";
import { buttonClasses } from "@/shared/ui/button";
import { ExternalLink } from "@/shared/ui/external-link";
import { KickIcon } from "@/shared/ui/icons";
import { getManageReading } from "@/readings/container";

export async function CurrentReadingHero() {
  const { turnstileSiteKey, kickChannelSlug } = await getPublicConfig();
  const reading = await getManageReading().getCurrentReading();
  const channelUrl = `https://kick.com/${kickChannelSlug}`;

  if (!reading) {
    return (
      <section className="rounded-2xl border border-ink-800 bg-ink-900 px-6 py-12 sm:px-10">
        <h1 className="max-w-2xl text-balance font-serif text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
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
          <ExternalLink href={channelUrl} showIcon={false} className={buttonClasses("secondary")}>
            <KickIcon className="size-4" />
            Ver el canal en Kick
          </ExternalLink>
        </div>
      </section>
    );
  }

  const { book } = reading;
  const liked = (await findLikedBookIds(await getViewer(), [book.id])).has(book.id);

  return (
    <section className="grid gap-8 rounded-2xl border border-ink-800 bg-ink-900 p-6 sm:grid-cols-[220px_1fr] sm:p-10">
      <BookCover
        coverId={book.coverId}
        title={book.title}
        size="L"
        priority
        className="mx-auto w-44 sm:w-full"
      />
      <div className="flex flex-col justify-center">
        <h1 className="text-balance font-serif text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
          <Link href={`/libros/${book.id}`} className="underline-offset-[6px] hover:underline">
            {book.title}
          </Link>
        </h1>
        <p className="mt-2 text-lg text-ink-300">{formatAuthors(book.authors)}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-300">
          <span
            className="size-2 shrink-0 rounded-full bg-paper motion-safe:animate-pulse"
            aria-hidden="true"
          />
          Es la lectura actual del stream
        </p>
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
          <ExternalLink href={channelUrl} showIcon={false} className={buttonClasses("primary")}>
            <KickIcon className="size-4" />
            Ver en Kick
          </ExternalLink>
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
  return <div aria-hidden="true" className="h-80 animate-pulse rounded-2xl bg-ink-900" />;
}
