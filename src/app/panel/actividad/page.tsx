import { Suspense } from "react";
import { getReviewBooks } from "@/moderation/container";
import { MODERATION_ACTION_LABELS } from "@/moderation/presentation/action-labels";
import { findStaffActor } from "@/moderators/presentation/staff-access";

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

export default function ActivityPage() {
  return (
    <Suspense fallback={<p className="text-ink-400">Cargando actividad…</p>}>
      <Activity />
    </Suspense>
  );
}

async function Activity() {
  const actor = await findStaffActor();
  if (!actor) return null;
  const actions = await getReviewBooks().listRecentActions(actor, 50);

  return (
    <section>
      <h2 className="font-serif text-2xl">Actividad reciente</h2>
      <p className="mt-1 text-sm text-ink-400">
        Registro de todo lo que hace el equipo de moderación.
      </p>
      {actions.length === 0 ? (
        <p className="mt-4 text-ink-400">Todavía no hay actividad.</p>
      ) : (
        <ol className="mt-4 divide-y divide-ink-800">
          {actions.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:justify-between"
            >
              <p>
                <span className="text-paper">@{entry.actorUsername ?? "desconocido"}</span>{" "}
                <span className="text-ink-400">{MODERATION_ACTION_LABELS[entry.action]}</span>{" "}
                {entry.bookTitle && <span className="font-serif">«{entry.bookTitle}»</span>}
                {entry.detail && <span className="text-ink-400"> — {entry.detail}</span>}
              </p>
              <time dateTime={entry.createdAt.toISOString()} className="shrink-0 text-ink-500">
                {timeFormatter.format(entry.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
