import { Suspense } from "react";
import { ModerationBookRow } from "@/moderation/presentation/moderation-book-row";
import {
  deleteBookAction,
  markBookReadAction,
  markBookUnreadAction,
  startReadingAction,
} from "@/moderation/presentation/moderation.actions";
import { getReviewBooks } from "@/moderation/container";
import { findStaffActor } from "@/moderators/presentation/staff-access";
import { ActionForm } from "@/shared/ui/action-form";

export default function PublishedBooksPage() {
  return (
    <Suspense fallback={<p className="text-ink-400">Cargando libros…</p>}>
      <PublishedBooks />
    </Suspense>
  );
}

async function PublishedBooks() {
  const actor = await findStaffActor();
  if (!actor) return null;
  const { books, total } = await getReviewBooks().listBooksByStatus(actor, [
    "approved",
    "reading",
    "read",
  ]);

  return (
    <section>
      <h2 className="font-serif text-2xl">Libros publicados ({total})</h2>
      <p className="mt-1 text-sm text-ink-400">
        Marca los libros que ya se leyeron en el stream para que aparezcan en el filtro «Leídos».
      </p>
      {books.length === 0 ? (
        <p className="mt-4 text-ink-400">Todavía no hay libros publicados.</p>
      ) : (
        <ul className="mt-2 divide-y divide-ink-800">
          {books.map((book) => (
            <ModerationBookRow
              key={book.id}
              book={book}
              actions={
                <>
                  {book.status === "approved" && (
                    <>
                      <ActionForm
                        action={startReadingAction}
                        fields={{ bookId: book.id }}
                        label="Empezar a leer"
                        variant="primary"
                      />
                      <ActionForm
                        action={markBookReadAction}
                        fields={{ bookId: book.id }}
                        label="Marcar leído"
                      />
                    </>
                  )}
                  {book.status === "read" && (
                    <ActionForm
                      action={markBookUnreadAction}
                      fields={{ bookId: book.id }}
                      label="Quitar de leídos"
                    />
                  )}
                  {book.status !== "reading" && (
                    <ActionForm
                      action={deleteBookAction}
                      fields={{ bookId: book.id }}
                      label="Eliminar"
                      variant="danger"
                      withReason
                      confirmMessage={`¿Eliminar «${book.title}»? Se perderán sus me gusta.`}
                    />
                  )}
                </>
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}
