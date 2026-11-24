"use client";

import Link from "next/link";
import { buttonClasses } from "@/shared/ui/button";
import { saveConsent, useCookieConsent } from "./use-cookie-consent";

export function CookieBanner() {
  const consent = useCookieConsent();
  if (consent !== "unknown") return null;

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl rounded-2xl bg-ink-850 p-5 shadow-[0_12px_40px_rgb(0_0_0/0.6)] motion-safe:animate-[banner-in_240ms_var(--ease-out)] sm:inset-x-6 sm:bottom-6"
    >
      <h2 id="cookie-banner-title" className="font-serif text-xl">
        Cookies en Non Soma
      </h2>
      <p className="mt-2 text-sm text-ink-300">
        Usamos cookies propias para mantener tu sesión de Kick y contar un voto por dispositivo. Los
        reproductores de YouTube y Spotify solo se cargan si aceptas. Para votar y proponer libros
        necesitas aceptarlas.{" "}
        <Link href="/cookies" className="text-paper underline underline-offset-4">
          Más información
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className={buttonClasses("primary")}
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className={buttonClasses("secondary")}
        >
          Rechazar
        </button>
      </div>
    </section>
  );
}
