# Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 10+
- Spotify Developer app with redirect URI configured

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

| Variable | Required | Description |
|----------|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Yes | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Yes | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | Yes | Must match Spotify dashboard (use `127.0.0.1` not `localhost`) |
| `ENCRYPTION_KEY` | Yes | 32-byte hex key for token encryption |
| `CRON_SECRET` | No | Bearer token for `/api/cron/sync` (Vercel sends automatically) |
| `AUTO_SYNC_ENABLED` | No | `true` in production by default |
| `AUTO_SYNC_INTERVAL_MINUTES` | No | Server-wide sync interval (default `360`) |
| `AUTO_SYNC_STALE_MINUTES` | No | Background sync on dashboard visit if stale (default `30`) |

## Local Development

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open http://127.0.0.1:3000 (Spotify OAuth requires `127.0.0.1`).

## Docker

```bash
cp .env.example .env
# Edit .env with your values

docker compose up --build
```

The `data/` volume persists your SQLite database at `./data/spotify.db`.

### Docker notes

- Pass env vars via `env_file: .env` in `docker-compose.yml`
- Run migrations before first start: `pnpm db:migrate` (or exec into container)
- Set production `SPOTIFY_REDIRECT_URI` to your public URL + `/api/auth/callback`

## Vercel

1. Import the repository
2. Set all environment variables in Project Settings
3. Add a Cron Job in `vercel.json` or Vercel dashboard:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

4. Set `CRON_SECRET` and configure the cron to send `Authorization: Bearer <CRON_SECRET>`

**Note:** Vercel serverless has ephemeral filesystem — SQLite persistence requires Vercel Blob or an external database for production. Docker/VPS is recommended for self-hosting with SQLite.

## Railway

1. Deploy from GitHub
2. Add environment variables
3. Mount a persistent volume at `/app/data`
4. Use Railway Cron to hit `GET /api/cron/sync` with the Bearer token every 6 hours

## Automatic Sync

Spotilyze syncs automatically in three ways — no manual cron setup required for Docker/VPS:

1. **Built-in scheduler** (production): starts with the server via `instrumentation.ts`, syncs all connected users every 6 hours (configurable via `AUTO_SYNC_INTERVAL_MINUTES`).
2. **Stale sync on visit**: when you open the dashboard and your last sync is older than 30 minutes, a background sync runs automatically.
3. **HTTP cron endpoint** (`/api/cron/sync`): for Vercel Cron or external schedulers.

### Docker / VPS (zero config)

Auto sync is **enabled by default** in production. Just run:

```bash
docker compose up --build
```

The scheduler starts automatically inside the container.

### Vercel

`vercel.json` already defines a cron job every 6 hours. Set `CRON_SECRET` in project env vars — Vercel sends it automatically in the `Authorization` header.

### Manual trigger (optional)

```bash
curl -X POST https://your-domain.com/api/cron/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

Manual sync via the dashboard Sync button (`POST /api/sync`) always remains available.

## Spotify App Setup

1. Create an app at https://developer.spotify.com/dashboard
2. Add redirect URI: `http://127.0.0.1:3000/api/auth/callback` (dev)
3. Add production URI: `https://your-domain.com/api/auth/callback`
4. Required scopes are requested automatically: `user-read-email`, `user-read-private`, `user-read-recently-played`, `user-top-read`
