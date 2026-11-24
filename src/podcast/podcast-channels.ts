const YOUTUBE_PLAYLIST_ID = "OLcFzYHJo-QAAgGd9ehST5iinC-s37J7vug";
const SPOTIFY_SHOW_ID = "5RZLCnkuNRR7fXfPLv2TAl";

export const podcastChannels = {
  youtube: {
    url: `https://www.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}`,
  },
  spotify: {
    url: `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`,
    embedUrl: `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?theme=0`,
  },
} as const;
