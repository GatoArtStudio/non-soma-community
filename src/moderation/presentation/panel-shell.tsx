import Link from "next/link";
import type { ReactNode } from "react";
import { getViewer } from "@/authentication/presentation/viewer";
import { KickLoginLink } from "@/authentication/presentation/user-menu";
import { canManageTeam, canModerate } from "@/moderators/domain/role";

const LINKS = [
  { href: "/panel", label: "Pendientes" },
  { href: "/panel/publicados", label: "Publicados" },
  { href: "/panel/lectura", label: "Lectura actual" },
  { href: "/panel/actividad", label: "Actividad" },
] as const;

/** Gate for the moderation area. Every use case re-checks the role on its own. */
export async function PanelShell({ children }: { children: ReactNode }) {
  const { user, role } = await getViewer();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-serif text-3xl">Panel de moderación</h1>
        <p className="text-ink-400">
          Entra con tu cuenta de Kick. Solo los moderadores del canal y su dueño tienen acceso.
        </p>
        <KickLoginLink returnTo="/panel" />
      </div>
    );
  }

  if (!canModerate(role)) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-serif text-3xl">Sin acceso</h1>
        <p className="text-ink-400">
          @{user.username}, el panel es solo para moderadores del canal. Si eres moderador, escribe
          un mensaje en el chat del stream o pide acceso al dueño del canal.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl">Panel de moderación</h1>
          <p className="text-sm text-ink-400">
            @{user.username} · {role === "owner" ? "Dueño del canal" : "Moderador"}
          </p>
        </div>
        <nav aria-label="Panel" className="flex flex-wrap gap-1.5 border-b border-ink-800 pb-4">
          {[
            ...LINKS,
            ...(canManageTeam(role) ? [{ href: "/panel/equipo", label: "Equipo" }] : []),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-ink-700 px-3 py-1 text-sm text-ink-300 transition-colors hover:border-ink-500 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
