# Contributing to Non Soma Community

Thanks for helping the community! Contributions of every size are welcome.

## Workflow

- `main` holds stable, production-ready code; `develop` is the integration branch.
- Create branches from `develop`:
  - `feature/<short-description>` for new features
  - `fix/<short-description>` for bug fixes
- Open pull requests against `develop`. CI must pass: format, lint, typecheck, tests and build.

## Commit messages

Use conventional commits in English:

```
<type>(<scope>): <description>
```

Examples: `feat(book-likes): allow unliking from the book page`,
`fix(authentication): reject expired login state`.

## Code guidelines

- **Language**: code, identifiers and technical docs are in English. User-facing text is
  Spanish (es-CO).
- **Architecture**: follow the existing layout. Business logic lives in a feature's
  `domain/` and `application/` folders, never in `src/app/` or React components.
  Infrastructure (Drizzle, HTTP clients) implements the ports declared in `domain/`.
- **Comments**: only for intent, constraints or non-obvious behavior. Don't narrate code.
- **Tests**: add or update unit tests for use cases you change (`*.test.ts`, with in-memory
  fakes from `src/test/fakes.ts`).
- **Database**: after editing a `*.table.ts` file, run `npm run db:generate` and commit the
  generated migration.
- **Secrets**: never commit secrets or `.env` files.

## Reporting security issues

Please do not open public issues for vulnerabilities. Contact the maintainers privately first.
