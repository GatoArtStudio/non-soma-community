import { Suspense } from "react";
import { formatDate } from "@/books/presentation/format";
import { getChatSubscription } from "@/kick-events/container";
import { getManageTeam } from "@/moderators/container";
import { GrantModeratorForm } from "@/moderators/presentation/grant-moderator-form";
import { findOwnerActor } from "@/moderators/presentation/staff-access";
import {
  ensureChatSubscriptionAction,
  restoreModeratorAction,
  revokeModeratorAction,
} from "@/moderators/presentation/team.actions";
import type { Actor } from "@/moderators/domain/staff-member";
import { ActionForm } from "@/shared/ui/action-form";

export default function TeamPage() {
  return (
    <Suspense fallback={<p className="text-ink-400">Cargando equipo…</p>}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  const owner = await findOwnerActor();
  if (!owner) {
    return <p className="text-ink-400">Solo el dueño del canal puede gestionar el equipo.</p>;
  }
  const moderators = await getManageTeam().listModerators(owner);
  const active = moderators.filter((moderator) => moderator.revokedAt === null);
  const revoked = moderators.filter((moderator) => moderator.revokedAt !== null);

  return (
    <div className="flex flex-col gap-10">
      <ChatDetection owner={owner} />

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">Moderadores ({active.length})</h2>
        <GrantModeratorForm />
        {active.length === 0 ? (
          <p className="text-ink-400">Aún no hay moderadores registrados.</p>
        ) : (
          <ul className="divide-y divide-ink-800">
            {active.map((moderator) => (
              <li
                key={moderator.kickUserId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-paper">@{moderator.username}</p>
                  <p className="text-xs text-ink-500">
                    {moderator.source === "chat_badge" ? "Detectado en el chat" : "Añadido a mano"}{" "}
                    · {formatDate(moderator.grantedAt)}
                  </p>
                </div>
                <ActionForm
                  action={revokeModeratorAction}
                  fields={{ kickUserId: moderator.kickUserId }}
                  label="Retirar acceso"
                  variant="danger"
                  confirmMessage={`¿Retirar el acceso de @${moderator.username}? No se volverá a añadir automáticamente.`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {revoked.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl">Acceso retirado</h2>
          <p className="text-sm text-ink-400">
            Estas cuentas no recuperan el acceso aunque tengan la insignia de moderador en el chat.
          </p>
          <ul className="divide-y divide-ink-800">
            {revoked.map((moderator) => (
              <li
                key={moderator.kickUserId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <p className="text-ink-300">@{moderator.username}</p>
                <ActionForm
                  action={restoreModeratorAction}
                  fields={{ kickUserId: moderator.kickUserId }}
                  label="Restaurar"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

async function ChatDetection({ owner }: { owner: Actor }) {
  const subscribed = await getChatSubscription()
    .getChatSubscriptionStatus(owner)
    .catch(() => null);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-ink-800 bg-ink-900 p-5">
      <h2 className="font-serif text-xl">Detección automática desde el chat</h2>
      <p className="text-sm text-ink-400">
        Kick no ofrece una lista de moderadores. El bot escucha el chat del canal y da acceso a
        quien escriba con la insignia de moderador.
      </p>
      <p className="text-sm">
        Estado:{" "}
        {subscribed === null ? (
          <span className="text-danger">no se pudo consultar a Kick</span>
        ) : subscribed ? (
          <span className="text-success">activa</span>
        ) : (
          <span className="text-danger">inactiva</span>
        )}
      </p>
      {!subscribed && (
        <ActionForm
          action={ensureChatSubscriptionAction}
          fields={{}}
          label="Activar detección"
          variant="primary"
        />
      )}
    </section>
  );
}
