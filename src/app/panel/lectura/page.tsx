import Link from "next/link";
import { Suspense } from "react";
import { BookCover } from "@/books/presentation/book-cover";
import { formatAuthors, formatDate } from "@/books/presentation/format";
import { getManageReading } from "@/readings/container";
import { findStaffActor } from "@/moderators/presentation/staff-access";
import {
  cancelReadingAction,
  finishReadingAction,
} from "@/moderation/presentation/moderation.actions";
import { ChapterForm } from "@/readings/presentation/chapter-form";
import { ActionForm } from "@/shared/ui/action-form";

export default function CurrentReadingPage() {
  return (
    <Suspense fallback={<p className="text-ink-400">Cargando lectura…</p>}>
      <CurrentReadingManager />
    </Suspense>
  );
}

async function CurrentReadingManager() {
  const actor = await findStaffActor();
  if (!actor) return null;
  const reading = await getManageReading().getCurrentReading();

  if (!reading) {
    return (
      <section className="rounded-2xl border border-dashed border-ink-700 px-6 py-10">
        <h2 className="font-serif text-2xl">No hay lectura en curso</h2>
        <p className="mt-2 text-ink-400">
          Elige un libro en{" "}
          <Link href="/panel/publicados" className="text-paper underline-offset-4 hover:underline">
            Publicados
          </Link>{" "}
          y pulsa «Empezar a leer». Aparecerá destacado en la portada.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8 rounded-2xl border border-ink-800 bg-ink-900 p-6 sm:flex-row">
      <BookCover
        coverId={reading.book.coverId}
        title={reading.book.title}
        className="w-32 shrink-0"
      />
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h2 className="font-serif text-3xl">{reading.book.title}</h2>
          <p className="text-ink-400">
            {formatAuthors(reading.book.authors)} · en lectura desde {formatDate(reading.startedAt)}
          </p>
        </div>
        <ChapterForm currentChapter={reading.currentChapter} />
        <div className="flex flex-wrap gap-3 border-t border-ink-800 pt-6">
          <ActionForm
            action={finishReadingAction}
            fields={{}}
            label="Terminamos el libro"
            variant="primary"
            confirmMessage="¿Marcar el libro como terminado? Pasará a «Leídos»."
          />
          <ActionForm
            action={cancelReadingAction}
            fields={{}}
            label="Cancelar lectura"
            variant="danger"
            confirmMessage="¿Cancelar la lectura? El libro vuelve a recomendados."
          />
        </div>
      </div>
    </section>
  );
}
