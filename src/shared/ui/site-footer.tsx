import Image from "next/image";
import { podcastChannels } from "@/podcast/podcast-channels";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1">
          <p>
            Club de lectura <span className="text-ink-300">Non Soma</span> con{" "}
            <a
              href="https://kick.com/elmune"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-300 underline-offset-4 hover:underline"
            >
              El Muñe
            </a>
            .
          </p>
          <p>
            <a
              href={podcastChannels.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-300 underline-offset-4 hover:underline"
            >
              YouTube
            </a>
            {" · "}
            <a
              href={podcastChannels.spotify.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-300 underline-offset-4 hover:underline"
            >
              Spotify
            </a>
          </p>
          <p>Proyecto comunitario de código abierto · Licencia MIT</p>
        </div>
        <a
          href="https://github.com/GatoArtStudio/non-soma-community"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 self-start text-ink-400 transition-colors hover:text-paper sm:self-auto"
        >
          <Image
            src="/brand/gatoartstudio.png"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-md ring-1 ring-ink-800 transition group-hover:ring-ink-600"
          />
          <span className="text-ink-200">Contribuir al proyecto</span>
        </a>
      </div>
    </footer>
  );
}
