import Link from "next/link";
import { Suspense } from "react";
import { BookGridSkeleton } from "@/books/presentation/book-grid";
import { TopRecommendations } from "@/books/presentation/top-recommendations";
import {
  CurrentReadingHero,
  CurrentReadingHeroSkeleton,
} from "@/readings/presentation/current-reading-hero";
import { LoginErrorNotice } from "@/authentication/presentation/login-error-notice";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-16">
      <Suspense fallback={null}>
        <LoginErrorNotice searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<CurrentReadingHeroSkeleton />}>
        <CurrentReadingHero />
      </Suspense>

      <section className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">Las más votadas</h2>
            <p className="mt-1 text-ink-400">
              Los libros que la comunidad quiere leer a continuación.
            </p>
          </div>
          <Link href="/libros" className="text-sm text-ink-300 underline-offset-4 hover:underline">
            Ver todos los libros
          </Link>
        </div>
        <Suspense fallback={<BookGridSkeleton />}>
          <TopRecommendations />
        </Suspense>
      </section>
    </div>
  );
}
