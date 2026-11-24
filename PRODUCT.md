# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: the stream community.** People who watch El Muñe on Kick (https://kick.com/elmune), mostly on their phones while the stream runs. They:
  - propose books for the club;
  - like the titles they want to read next;
  - check what the club is reading right now and which chapter it has reached.
    They can do all of this anonymously, or signed in with Kick so their `@username` shows on what they propose.
- **Secondary: the channel's moderators and its owner.** They sign in with Kick and run the moderation panel. From there they:
  - approve, reject or delete proposals;
  - mark books as read;
  - start a reading, update its chapter and finish it.
    The owner also manages who is on the team.

## Product Purpose

Non Soma Community is the web home of **Non Soma**, the book club led by the Colombian creator El Muñe. In the club, one book is read chapter by chapter over several months during live streams. The site lets the community decide which book comes next: proposals go through a review queue, and the most-liked ones rise as recommendations. The site also shows the club's history, meaning the books already read and the current reading.

Success has three parts:

- The community actively proposes and votes.
- The moderators keep the catalog clean with little effort.
- The current reading is always accurate.

## Positioning

It is the club's own space. It is tied to the Kick channel that hosts the readings: moderator access comes from the channel's real moderators, detected through the bot, and the current reading mirrors what happens on stream. It is not a generic book-voting site. Its catalog, its votes and its history are those of this one community.

## Operating Context

- **Readings:** they happen live on Kick. Past readings are published as a YouTube playlist (video) and a Spotify podcast, both embedded on the site.
- **Moderator detection:** a dedicated Kick bot app receives chat webhooks. Moderators are detected from their moderator badge in the channel chat, and the owner can add or revoke them manually.
- **Book data:** it comes from Open Library, so proposals are picked from search results instead of being typed in free text.
- **Hosting:** Docker Compose (Dokploy) behind Cloudflare, served over HTTPS.

## Capabilities and Constraints

- **Proposing and liking:** both work anonymously or with Kick login, and both always go through Cloudflare Turnstile and rate limits. Each Kick account gets one like per book. Anonymous visitors get one like per device, identified by a cookie. IPs are never used to identify people, because mobile carriers put many viewers behind one address. Voting and proposing require accepting cookies.
- **Book lifecycle:** every proposal starts as pending. From there a book can be:
  - approved, which makes it a recommendation;
  - rejected, which keeps it so it cannot be proposed again;
  - read;
  - the current reading, with a chapter note. Only one reading can be open at a time.
- **Moderation:** every moderation action is recorded in an audit log.
- **Language:** the user interface is in Spanish (es-CO). Code and technical documentation are in English.
- **Open source:** the project is open source under the MIT License, and community contributions are welcome through the GitHub repository.

## Brand Commitments

- **Name:** "Non Soma" is the club; "Non Soma Community" is this platform. The club's name never ends in an "n".
- **Logo:** the official logo is the open book with an eye above it and the wordmark "NON SOMA". The book mark currently in the header is a placeholder until the official logo file is supplied.
- **Colors:** the identity is strictly black and white, white on black. There is no accent color.
- **Voice:** Colombian Spanish, warm and communal, addressing the reader as "tú".

## Evidence on Hand

- Book covers and bibliographic data come from Open Library.
- Real channel links:
  - Kick: https://kick.com/elmune
  - YouTube playlist: https://www.youtube.com/playlist?list=OLcFzYHJo-QAAgGd9ehST5iinC-s37J7vug
  - Spotify show: https://open.spotify.com/show/5RZLCnkuNRR7fXfPLv2TAl
- There are no testimonials, member counts or statistics. Do not invent any.

## Product Principles

1. **The community decides, the moderators curate.** Proposals and votes drive what comes next; every proposal still goes through review.
2. **Trust the votes.** Every vote and proposal is protected from bots, so the ranking reflects real people.
3. **The stream is the source of truth.** The current reading, the chapter and the team mirror what happens on Kick.
4. **Mobile first, mid-stream.** Most visits happen on a phone while the stream is on, so the main actions must be quick and easy to tap.

## Accessibility & Inclusion

The site targets WCAG 2.2 AA:

- text contrast of at least 4.5:1;
- full keyboard operation with visible focus;
- correct names for screen readers;
- touch targets of at least 44px on touch devices;
- motion that respects `prefers-reduced-motion`.
