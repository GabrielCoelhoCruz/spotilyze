# Spotify Stats

![Hero GIF placeholder](./public/hero.gif)

> Your personal Spotify listening history, visualized. Self-host in one command.

## Why

Spotify gives artists rich analytics, but listeners get almost no insight into their own habits. This app fills that gap by importing your personal streaming history and turning it into a clean, fast dashboard you control.

- **Privacy first**: your data lives on your machine, not a third-party server.
- **No subscriptions**: run it locally or on a cheap VPS forever.
- **Hackable**: built with Next.js, TypeScript, Tailwind CSS, and Drizzle ORM on SQLite.

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Run the development server
pnpm dev

# 3. Open http://localhost:3000
```

## Self-host with Docker

```bash
docker compose up --build
```

Then open http://localhost:3000. The `data/` directory is mounted as a volume so your database persists across restarts.

## Features

- SQLite-backed storage via Drizzle ORM
- User and token management
- Track, artist, and listen ingestion
- Daily aggregated statistics
- Responsive Tailwind CSS UI
- Dockerized, one-command deployment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and add tests if applicable
4. Run `pnpm lint` and `pnpm typecheck`
5. Open a pull request

## Roadmap

- [ ] Spotify OAuth login
- [ ] Upload and parse streaming history JSON
- [ ] Dashboard charts and filters
- [ ] Export and backup utilities
- [ ] Dark mode
