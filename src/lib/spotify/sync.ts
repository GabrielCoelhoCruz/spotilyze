import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'
import { spotifyFetch } from '@/lib/spotify/client'

interface SpotifyArtistRef {
  id: string
  name: string
}

interface SpotifyTrack {
  id: string
  name: string
  duration_ms: number
  popularity?: number
  explicit: boolean
  preview_url: string | null
  external_urls?: Record<string, string>
  artists: SpotifyArtistRef[]
  album?: { id: string }
}

interface RecentlyPlayedItem {
  played_at: string
  track: SpotifyTrack
  context?: {
    type?: string
    uri?: string
  } | null
}

interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[]
}

export interface SyncResult {
  imported: number
  skipped: number
  total: number
}

export const syncRecentlyPlayed = async (userId: string): Promise<SyncResult> => {
  const response = await spotifyFetch(userId, '/me/player/recently-played?limit=50')

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Spotify recently-played failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as RecentlyPlayedResponse
  let imported = 0
  let skipped = 0

  for (const item of data.items) {
    const track = item.track
    const artistIds = track.artists.map((artist) => artist.id)

    for (const artist of track.artists) {
      await db
        .insert(artists)
        .values({
          id: artist.id,
          name: artist.name,
          genres: [],
        })
        .onConflictDoNothing()
    }

    await db
      .insert(tracks)
      .values({
        id: track.id,
        name: track.name,
        artistIds,
        albumId: track.album?.id ?? null,
        durationMs: track.duration_ms,
        popularity: track.popularity ?? null,
        explicit: track.explicit,
        previewUrl: track.preview_url,
        externalUrls: track.external_urls ?? null,
      })
      .onConflictDoUpdate({
        target: tracks.id,
        set: {
          name: track.name,
          artistIds,
          albumId: track.album?.id ?? null,
          durationMs: track.duration_ms,
          popularity: track.popularity ?? null,
          explicit: track.explicit,
          previewUrl: track.preview_url,
          externalUrls: track.external_urls ?? null,
        },
      })

    const insertResult = db
      .insert(listens)
      .values({
        userId,
        trackId: track.id,
        playedAt: new Date(item.played_at),
        contextType: item.context?.type ?? null,
        contextUri: item.context?.uri ?? null,
        source: 'spotify',
      })
      .onConflictDoNothing()
      .run()

    if (insertResult.changes > 0) {
      imported += 1
    } else {
      skipped += 1
    }
  }

  return {
    imported,
    skipped,
    total: data.items.length,
  }
}

export const syncUserListeningData = async (userId: string): Promise<SyncResult> => {
  return syncRecentlyPlayed(userId)
}
