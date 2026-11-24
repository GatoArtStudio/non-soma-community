import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "@/cookie-consent/presentation/cookie-preferences-button";
import { podcastChannels } from "@/podcast/podcast-channels";
import { ExternalLink } from "./external-link";
import { KickIcon, SpotifyIcon, YouTubeIcon } from "./icons";

const SOCIAL_LINKS = [
  { href: "https://kick.com/elmune", label: "Kick", Icon: KickIcon },
  { href: podcastChannels.youtube.url, label: "YouTube", Icon: YouTubeIcon },
  { href: podcastChannels.spotify.url, label: "Spotify", Icon: SpotifyIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <p>
            Club de lectura <span className="text-ink-200">Non Soma</span> con{" "}
            <span className="text-ink-200">El Muñe</span>.
          </p>
          <ul aria-label="Non Soma en otras plataformas" className="-ml-2.5 flex flex-wrap gap-1">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <li key={label}>
                <ExternalLink
                  href={href}
                  showIcon={false}
                  className="min-h-9 gap-1.5 rounded-full px-2.5 text-ink-300 transition-colors duration-150 hover:bg-ink-850 hover:text-paper pointer-coarse:min-h-11"
                >
                  <Icon className="size-4" />
                  {label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-500">
            <span>Proyecto comunitario de código abierto · Licencia MIT</span>
            <Link href="/cookies" className="underline-offset-4 hover:text-paper hover:underline">
              Cookies
            </Link>
            <CookiePreferencesButton className="underline-offset-4 hover:text-paper hover:underline" />
          </p>
        </div>
        <ExternalLink
          href="https://github.com/GatoArtStudio/non-soma-community"
          className="group gap-2.5 self-start text-ink-200 transition-colors duration-150 hover:text-paper sm:self-auto"
        >
          <Image
            src="/brand/gatoartstudio.png"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-md ring-1 ring-ink-800 transition-shadow duration-150 group-hover:ring-ink-600"
          />
          Contribuir al proyecto
        </ExternalLink>
      </div>
    </footer>
  );
}
