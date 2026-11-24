import { Suspense } from "react";
import { ModerationBookRow } from "@/moderation/presentation/moderation-book-row";
import {
  approveBookAction,
  deleteBookAction,
  rejectBookAction,
  restoreBookAction,
} from "@/moderation/presentation/moderation.actions";
import { getReviewBooks } from "@/moderation/container";
import { findStaffActor } from "@/moderators/presentation/staff-access";
import { ActionForm } from "@/shared/ui/action-form";

export default function PendingBooksPage() {
  return (
    <Suspense fallback={<p className="text-ink-400">Cargando propuestas…</p>}>
      <PendingBooks />
    </Suspense>
  );
}

async function PendingBooks() {
  const actor = await findStaffActor();
  if (!actor) return null;
  const review = getReviewBooks();
  const [pending, rejected] = await Promise.all([
    review.listBooksByStatus(actor, ["pending"]),
    review.listBooksByStatus(actor, ["rejected"]),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-serif text-2xl">Propuestas pendientes ({pending.total})</h2>
        {pending.books.length === 0 ? (
          <p className="mt-4 text-ink-400">No hay propuestas por revisar. ¡Todo al día!</p>
        ) : (
          <ul className="mt-2 divide-y divide-ink-800">
            {pending.books.map((book) => (
              <ModerationBookRow
                key={book.id}
                book={book}
                actions={
                  <>
                    <ActionForm
                      action={approveBookAction}
                      fields={{ bookId: book.id }}
                      label="Aprobar"
                      variant="primary"
                    />
                    <ActionForm
                      action={rejectBookAction}
                      fields={{ bookId: book.id }}
                      label="Rechazar"
                      withReason
                    />
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>

      {rejected.books.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl">Rechazadas ({rejected.total})</h2>
          <p className="mt-1 text-sm text-ink-400">
            Se conservan para que no puedan proponerse de nuevo. Elimínalas para permitirlo.
          </p>
          <ul className="mt-2 divide-y divide-ink-800">
            {rejected.books.map((book) => (
              <ModerationBookRow
                key={book.id}
                book={book}
                actions={
                  <>
                    <ActionForm
                      action={restoreBookAction}
                      fields={{ bookId: book.id }}
                      label="Publicar"
                    />
                    <ActionForm
                      action={deleteBookAction}
                      fields={{ bookId: book.id }}
                      label="Eliminar"
                      variant="danger"
                      confirmMessage={`¿Eliminar «${book.title}» definitivamente?`}
                    />
                  </>
                }
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
