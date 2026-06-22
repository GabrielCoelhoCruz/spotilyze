# Contributing to Spotilyze

Thanks for your interest in contributing! This project is open source and community contributions are welcome.

## Getting started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies: `pnpm install`
4. **Configure** environment: `cp .env.example .env.local` and fill in Spotify credentials
5. **Migrate** the database: `pnpm db:migrate`
6. **Run** the dev server: `pnpm dev` (use `http://127.0.0.1:3000`, not `localhost`)

Try the app without Spotify credentials via **Demo mode**: visit `/demo/dashboard`.

## Development workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes with tests where applicable
3. Run checks before committing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Open a pull request with a clear description of what changed and why

## Code style

- TypeScript strict mode — avoid `any`
- Functional React components with hooks
- Tailwind CSS for styling; use theme tokens (`bg-card`, `text-muted-foreground`) not hardcoded colors
- Keep changes focused — one feature or fix per PR when possible

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(dashboard): add genre filter
fix(oauth): handle invalid_state on re-login
docs(readme): add demo mode instructions
```

## Project structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # UI components (dashboard, motion, shadcn)
  db/            # Drizzle schema and SQLite client
  lib/           # Business logic (spotify, auth, demo-data, aggregations)
```

## Reporting bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Browser/OS and whether you used demo mode or real Spotify login
- Relevant logs (redact tokens and secrets)

## Feature requests

Open an issue describing the use case before starting large work. Check the README roadmap for planned features.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
