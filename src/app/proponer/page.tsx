import type { Metadata } from "next";
import { Suspense } from "react";
import { getViewer } from "@/authentication/presentation/viewer";
import { KickLoginLink } from "@/authentication/presentation/user-menu";
import { ProposeBookForm } from "@/books/presentation/propose-book-form";
import { canModerate } from "@/moderators/domain/role";
import { getPublicConfig } from "@/shared/config/public-config";

export const metadata: Metadata = {
  title: "Proponer un libro",
  description: "Propón un libro para el club de lectura Non Soma.",
};

export default function ProposePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl">Proponer un libro</h1>
        <p className="mt-2 text-ink-400">
          Cada propuesta la revisan los moderadores del canal antes de publicarse. Si ya está en la
          plataforma, dale me gusta en vez de proponerlo de nuevo.
        </p>
      </header>
      <Suspense
        fallback={<div aria-hidden="true" className="h-40 animate-pulse rounded-2xl bg-ink-900" />}
      >
        <ProposeSection />
      </Suspense>
    </div>
  );
}

async function ProposeSection() {
  const { turnstileSiteKey } = await getPublicConfig();
  const { user, role } = await getViewer();

  return (
    <>
      <div className="rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4 text-sm">
        {user ? (
          <p className="text-ink-300">
            Tu propuesta aparecerá a nombre de <span className="text-paper">@{user.username}</span>.
            {canModerate(role) && " Como moderador, se publicará de inmediato."}
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-300">
              Estás proponiendo de forma anónima. Entra con Kick si quieres que aparezca tu @.
            </p>
            <KickLoginLink returnTo="/proponer" />
          </div>
        )}
      </div>
      <ProposeBookForm turnstileSiteKey={turnstileSiteKey} />
    </>
  );
}
