import { podcastChannels } from "@/podcast/podcast-channels";

export function PodcastSection() {
  return (
    <section aria-labelledby="podcast-heading" className="flex flex-col gap-8">
      <div>
        <h2 id="podcast-heading" className="font-serif text-3xl">
          Mira y escucha Non Soma
        </h2>
        <p className="mt-1 text-ink-400">
          Las lecturas pasadas, en video en YouTube o como podcast en Spotify.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium uppercase tracking-widest text-ink-400">YouTube</h3>
            <a
              href={podcastChannels.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-300 underline-offset-4 hover:text-paper hover:underline"
            >
              Abrir la playlist
            </a>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-800 lg:aspect-auto lg:h-[352px]">
            <iframe
              src={podcastChannels.youtube.embedUrl}
              title="Playlist de Non Soma en YouTube"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="size-full"
            />
          </div>
        </article>
        <article className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium uppercase tracking-widest text-ink-400">Spotify</h3>
            <a
              href={podcastChannels.spotify.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-300 underline-offset-4 hover:text-paper hover:underline"
            >
              Abrir el podcast
            </a>
          </div>
          {/* Spotify's full player layout (with the episode list) needs exactly 352px of height. */}
          <div className="h-[352px] overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-800">
            <iframe
              src={podcastChannels.spotify.embedUrl}
              title="Podcast Non Soma en Spotify"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="size-full"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
