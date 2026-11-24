import Link from "next/link";
import { getViewer } from "@/authentication/presentation/viewer";
import { findLikedBookIds } from "@/book-likes/presentation/liked-books";
import { getBrowseBooks } from "@/books/container";
import { getPublicConfig } from "@/shared/config/public-config";
import { buttonClasses } from "@/shared/ui/button";
import { BookGrid } from "./book-grid";

export async function TopRecommendations() {
  const { turnstileSiteKey } = await getPublicConfig();
  const books = await getBrowseBooks().topRecommendations(10);

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700 px-6 py-12 text-center">
        <p className="font-serif text-2xl">Todavía no hay recomendaciones.</p>
        <p className="mt-2 text-ink-400">Sé la primera persona en proponer un libro.</p>
        <Link href="/proponer" className={buttonClasses("primary", "mt-6")}>
          Proponer un libro
        </Link>
      </div>
    );
  }

  const likedBookIds = await findLikedBookIds(
    await getViewer(),
    books.map((book) => book.id),
  );
  return (
    <BookGrid
      books={books}
      likedBookIds={likedBookIds}
      turnstileSiteKey={turnstileSiteKey}
      ranked
    />
  );
}
