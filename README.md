# Non Soma Community

> **Español:** plataforma comunitaria del club de lectura **Non Soma**, dirigido por
> [El Muñe](https://kick.com/elmune). La comunidad propone libros y les da «me gusta» para
> decidir las próximas lecturas en directo. Los moderadores del canal de Kick entran con su
> cuenta para aprobar propuestas, marcar libros leídos y elegir la lectura actual.

Open source web platform for the Non Soma book club community, built with Next.js, MySQL and
Kick OAuth. Released under the [MIT License](./LICENSE).

## Features

- **Book proposals**: anyone can propose a book, anonymously or signed in with Kick (which
  shows their `@username`). Titles come from [Open Library](https://openlibrary.org), so
  duplicates and typos are avoided. Every proposal waits for moderator approval.
- **Likes**: the community likes books to push them up the recommendations.
- **Moderation panel** for the channel owner and moderators:
  - approve, reject or delete books
  - mark books as read
  - start, update (chapter) and finish the current stream reading
  - review an audit log of every action
- **Team management**: the channel owner grants and revokes moderators.
- **Anti-bot protection** on every proposal and like:
  - Cloudflare Turnstile
  - MySQL-backed rate limits
  - a honeypot field
  - one like per Kick account, and per anonymous browser and network

## How moderator access works

The Kick public API has no endpoint for listing a channel's moderators, so access is resolved
like this:

| Role      | How it is granted                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner     | The signed-in Kick user id matches the `broadcaster_user_id` of `KICK_CHANNEL_SLUG`.                                                           |
| Moderator | Either (a) the owner adds them in **Panel → Equipo**, or (b) the bot sees a `moderator` badge in a chat message (`chat.message.sent` webhook). |
| Member    | Everyone else.                                                                                                                                 |

Revocations made by the owner always win. A revoked moderator is not re-added by their chat
badge until the owner restores them.

## Architecture

The code follows **screaming architecture**: top-level folders in `src/` are business
capabilities. Inside each one, hexagonal layers keep the domain independent of frameworks.

```
src/
  app/              Next.js routes only (composition, no business logic)
  authentication/   Kick OAuth 2.1 + PKCE login, database sessions
  moderators/       roles (owner/moderator/member), team management
  books/            proposals, catalog browsing, Open Library adapter
  book-likes/       likes with per-account / per-visitor / per-network uniqueness
  moderation/       approve/reject/delete/mark read, audit log
  readings/         current stream reading and chapter tracking
  kick-events/      signed Kick webhooks (moderator badge detection)
  bot-protection/   Turnstile verification, rate limiting, request fingerprint
  kick-platform/    Kick public API client
  shared/           config, database client, crypto, UI primitives
```

Each feature contains some of these layers:

- `domain/`: entities, rules and port interfaces.
- `application/`: use cases.
- `infrastructure/`: Drizzle repositories and HTTP adapters.
- `presentation/`: React components and Server Actions.
- `container.ts`: wires adapters into use cases.

## Tech stack

| Area      | Tools                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Cache Components / PPR, Server Actions), React 19, TypeScript |
| Styling   | Tailwind CSS 4                                                                        |
| Data      | MySQL 8.4 with Drizzle ORM and SQL migrations                                         |
| Tooling   | Zod, Vitest, ESLint, Prettier                                                         |
| Hosting   | Docker Compose, deployed behind a Cloudflare Tunnel                                   |

## Getting started

### Requirements

- Node.js 24+
- Docker (for MySQL, or for the full stack)
- A Kick developer app ([kick.com/settings/developer](https://kick.com/settings/developer))
- A Cloudflare Turnstile widget (the test keys in `.env.example` work locally)

### Local development

```bash
cp .env.example .env            # fill in APP_SECRET, Kick credentials, passwords
docker compose up -d db         # MySQL only (or use your own server)
npm install
npm run db:migrate
npm run dev
```

The app runs at http://localhost:3000. For MySQL from compose to be reachable from the host,
publish port `3306` in a `docker-compose.override.yml`, or point `DATABASE_URL` at your own server.

### Kick app configuration

In the Kick developer settings:

1. **Redirect URI**: `${APP_URL}/api/auth/kick/callback`
2. **Scopes**: the app only requests `user:read`. The Kick access token is revoked right after
   login, and only the identity is kept.
3. **Webhooks**: enable them and set the URL to `${APP_URL}/api/webhooks/kick`. Then, signed in as
   the channel owner, open **Panel → Equipo** and press **Activar detección**. That subscribes
   the app to `chat.message.sent` for the channel, using an app access token. Kick disables
   subscriptions whose webhook keeps failing; the same button re-creates them.

Webhooks need a public HTTPS URL. For local testing use a Cloudflare Tunnel.

### Useful scripts

| Script                | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Development server                                 |
| `npm run build`       | Production build (does not need env variables)     |
| `npm test`            | Unit tests (Vitest)                                |
| `npm run lint`        | ESLint                                             |
| `npm run typecheck`   | TypeScript                                         |
| `npm run db:generate` | Generate a migration after changing a `*.table.ts` |
| `npm run db:migrate`  | Apply pending migrations                           |

## Deployment (Docker Compose + Cloudflare)

```bash
cp .env.example .env    # production values, APP_URL=https://your-domain
docker compose up -d --build
```

The stack has these services:

- **`db`**: MySQL with a persistent volume, only on an internal network.
- **`migrate`**: applies Drizzle migrations, then exits.
- **`app`**: the Next.js standalone server, bound to `127.0.0.1:${APP_PORT:-3000}`.

The compose file does not run Cloudflare itself. The server's existing Cloudflare Tunnel should
route the public hostname to `http://localhost:${APP_PORT:-3000}`.

### Cloudflare recommendations

- Set `TRUST_CLOUDFLARE=true` only when the origin is reachable exclusively through Cloudflare.
  The app then reads the client IP from `CF-Connecting-IP`.
- Set `TURNSTILE_EXPECTED_HOSTNAME` to your domain in production. With it set, tokens must
  match both the hostname and the action.
- Suggested WAF rate-limit rules on top of the app limits:
  - `POST` on `/proponer` and `/libros/*`
  - `GET` on `/api/books/search` and `/api/auth/kick/login`
- Enable "Always Use HTTPS". Session cookies use the `__Host-` prefix when `APP_URL` is HTTPS.

## Security notes

- Raw IP addresses and visitor ids are never stored. Only HMAC hashes keyed with `APP_SECRET`
  are kept.
- Sessions are random tokens. Only their SHA-256 hash is stored in MySQL.
- Kick webhooks are checked in four ways:
  - their RSA-SHA256 signature is verified against Kick's public key;
  - deliveries older than 10 minutes are rejected;
  - repeated message ids are ignored;
  - events for other channels are ignored.
- Every use case checks the actor's role, so the panel UI is not the only guard.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
