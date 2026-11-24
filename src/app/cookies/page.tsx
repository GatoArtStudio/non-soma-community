import type { Metadata } from "next";
import { CookiePreferencesButton } from "@/cookie-consent/presentation/cookie-preferences-button";
import { buttonClasses } from "@/shared/ui/button";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Qué cookies usa Non Soma Community y para qué.",
};

const OWN_COOKIES = [
  {
    name: "nsc_cookie_consent",
    purpose: "Guarda si aceptaste o rechazaste las cookies.",
    duration: "1 año",
    when: "Al elegir en el aviso de cookies",
  },
  {
    name: "nsc_visitor",
    purpose:
      "Identifica tu dispositivo para contar un solo voto por libro y limitar abusos. Se guarda cifrado; no contiene datos personales.",
    duration: "1 año",
    when: "Solo si aceptas, al votar o proponer sin iniciar sesión",
  },
  {
    name: "__Host-nsc_session",
    purpose: "Mantiene tu sesión cuando entras con tu cuenta de Kick.",
    duration: "30 días",
    when: "Al iniciar sesión",
  },
  {
    name: "__Host-nsc_kick_login",
    purpose: "Protege el inicio de sesión con Kick mientras se completa.",
    duration: "10 minutos",
    when: "Al pulsar «Entrar con Kick»",
  },
] as const;

export default function CookiesPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header>
        <h1 className="font-serif text-4xl tracking-[-0.02em]">Cookies</h1>
        <p className="mt-3 text-ink-300">
          Non Soma Community usa solo las cookies necesarias para funcionar. No usamos cookies de
          publicidad ni de analítica. Puedes ver la web sin aceptarlas; para votar y proponer libros
          sí hace falta aceptarlas, porque así contamos un voto por dispositivo.
        </p>
      </header>

      <section aria-labelledby="own-cookies" className="flex flex-col gap-4">
        <h2 id="own-cookies" className="font-serif text-2xl">
          Cookies propias
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-ink-800">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-ink-400">
              <tr className="border-b border-ink-800">
                <th scope="col" className="px-4 py-3 font-medium">
                  Cookie
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Para qué sirve
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Cuándo se crea
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 text-ink-200">
              {OWN_COOKIES.map((cookie) => (
                <tr key={cookie.name} className="align-top">
                  <th scope="row" className="px-4 py-3 font-mono text-xs font-normal text-paper">
                    {cookie.name}
                  </th>
                  <td className="px-4 py-3">{cookie.purpose}</td>
                  <td className="px-4 py-3 text-ink-300">{cookie.when}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-300">{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="third-party" className="flex flex-col gap-3">
        <h2 id="third-party" className="font-serif text-2xl">
          Servicios de terceros
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-ink-300 marker:text-ink-500">
          <li>
            <span className="text-paper">Cloudflare Turnstile</span> verifica que eres una persona
            cuando votas o propones un libro. Cloudflare procesa esa verificación.
          </li>
          <li>
            <span className="text-paper">YouTube y Spotify</span> ponen sus propias cookies al
            cargar sus reproductores. Por eso solo se cargan si aceptas las cookies o si pulsas
            «Cargar reproductor».
          </li>
        </ul>
      </section>

      <section aria-labelledby="change-choice" className="flex flex-col items-start gap-3">
        <h2 id="change-choice" className="font-serif text-2xl">
          Cambiar tu elección
        </h2>
        <p className="text-ink-300">
          Puedes volver a elegir en cualquier momento. Si rechazas, borramos la cookie de tu
          dispositivo.
        </p>
        <CookiePreferencesButton className={buttonClasses("secondary")} />
      </section>
    </article>
  );
}
