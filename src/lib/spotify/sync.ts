import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'

import { db } from '@/db'
import { artists, listens, tracks, users } from '@/db/schema'
import { spotifyFetch } from '@/lib/spotify/client'
import { isSpotifyCatalogId } from '@/lib/spotify/catalog'
import { lookupGenresForArtist } from '@/lib/musicbrainz/genres'

interface SpotifyArtistRef {
  id: string
  name: string
}

interface SpotifyImage {
  url: string
}

interface SpotifyAlbumRef {
  id: string
  images?: SpotifyImage[]
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
  album?: SpotifyAlbumRef
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

interface SpotifyArtistPayload {
  id: string
  name: string
  genres?: string[]
  popularity?: number
  followers?: { total: number }
  images?: SpotifyImage[]
}

interface SpotifyArtistDetail extends SpotifyArtistPayload {
  genres: string[]
  popularity: number
  followers: { total: number }
  images: SpotifyImage[]
}

interface SpotifyAlbumDetail {
  id: string
  images: SpotifyImage[]
}

export interface SyncResult {
  imported: number
  skipped: number
  total: number
}

const mapWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> => {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    await Promise.all(batch.map(fn))
  }
}

const pickImageUrl = (images?: SpotifyImage[]): string | null => images?.[0]?.url ?? null

const upsertArtist = async (artist: SpotifyArtistPayload): Promise<void> => {
  const [existing] = await db
    .select()
    .from(artists)
    .where(eq(artists.id, artist.id))
    .limit(1)

  const imageUrl = pickImageUrl(artist.images) ?? existing?.imageUrl ?? null
  const values = {
    id: artist.id,
    name: artist.name,
    genres: artist.genres ?? existing?.genres ?? [],
    popularity: artist.popularity ?? existing?.popularity ?? null,
    followers: artist.followers?.total ?? existing?.followers ?? null,
    imageUrl,
  }

  await db
    .insert(artists)
    .values(values)
    .onConflictDoUpdate({
      target: artists.id,
      set: {
        name: values.name,
        genres: values.genres,
        popularity: values.popularity,
        followers: values.followers,
        imageUrl: values.imageUrl,
      },
    })
}

const enrichFromTopArtists = async (userId: string): Promise<void> => {
  const timeRanges = ['short_term', 'medium_term', 'long_term'] as const

  for (const timeRange of timeRanges) {
    const response = await spotifyFetch(
      userId,
      `/me/top/artists?limit=50&time_range=${timeRange}`,
    )
    if (!response.ok) continue

    const data = (await response.json()) as { items: SpotifyArtistPayload[] }
    for (const artist of data.items) {
      try {
        await upsertArtist(artist)
      } catch (error) {
        console.error(`Failed to upsert top artist ${artist.id}:`, error)
      }
    }
  }
}

const fetchAndUpsertArtist = async (userId: string, artistId: string): Promise<void> => {
  const response = await spotifyFetch(userId, `/artists/${artistId}`)
  if (!response.ok) {
    if (response.status !== 404) {
      const body = await response.text()
      console.error(`Spotify artist lookup failed for ${artistId} (${response.status}): ${body}`)
    }
    return
  }

  const artist = (await response.json()) as SpotifyArtistDetail
  await upsertArtist(artist)
}

const enrichArtists = async (userId: string, artistIds: string[]): Promise<void> => {
  const uniqueIds = [...new Set(artistIds.filter(isSpotifyCatalogId))]
  if (uniqueIds.length === 0) return

  try {
    await mapWithConcurrency(uniqueIds, 5, async (artistId) => {
      await fetchAndUpsertArtist(userId, artistId)
    })

    await enrichFromTopArtists(userId)
  } catch (error) {
    console.error('Artist enrichment failed:', error)
  }
}

const backfillMissingArtistImages = async (userId: string): Promise<void> => {
  const rows = await db
    .select({ artistId: artists.id })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(sql`json_each(${tracks.artistIds}) as track_artist`, sql`1=1`)
    .innerJoin(artists, sql`${artists.id} = track_artist.value`)
    .where(and(eq(listens.userId, userId), isNull(artists.imageUrl)))

  const artistIds = [
    ...new Set(
      rows
        .map((row) => row.artistId)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  if (artistIds.length === 0) return

  try {
    await mapWithConcurrency(artistIds.filter(isSpotifyCatalogId), 5, async (artistId) => {
      await fetchAndUpsertArtist(userId, artistId)
    })

    await enrichFromTopArtists(userId)
  } catch (error) {
    console.error('Artist image backfill failed:', error)
  }
}

const GENRE_BACKFILL_LIMIT = 30

const backfillMissingArtistGenres = async (userId: string): Promise<void> => {
  const rows = await db
    .select({ id: artists.id, name: artists.name })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(sql`json_each(${tracks.artistIds}) as track_artist`, sql`1=1`)
    .innerJoin(artists, sql`${artists.id} = track_artist.value`)
    .where(
      and(
        eq(listens.userId, userId),
        sql`json_array_length(${artists.genres}) = 0`,
      ),
    )

  const uniqueArtists = new Map<string, string>()
  for (const row of rows) {
    if (!uniqueArtists.has(row.id)) {
      uniqueArtists.set(row.id, row.name)
    }
    if (uniqueArtists.size >= GENRE_BACKFILL_LIMIT) break
  }

  try {
    for (const [artistId, name] of uniqueArtists) {
      const genres = await lookupGenresForArtist(name)
      if (genres.length === 0) continue

      await db.update(artists).set({ genres }).where(eq(artists.id, artistId))
    }
  } catch (error) {
    console.error('Artist genre backfill failed:', error)
  }
}

const enrichAlbumImages = async (userId: string, albumIds: string[]): Promise<void> => {
  const uniqueIds = [...new Set(albumIds.filter(isSpotifyCatalogId))]
  if (uniqueIds.length === 0) return

  try {
    await mapWithConcurrency(uniqueIds, 5, async (albumId) => {
      const response = await spotifyFetch(userId, `/albums/${albumId}`)
      if (!response.ok) return

      const album = (await response.json()) as SpotifyAlbumDetail
      const imageUrl = pickImageUrl(album.images)
      if (!imageUrl) return

      await db.update(tracks).set({ imageUrl }).where(eq(tracks.albumId, albumId))
    })
  } catch (error) {
    console.error('Album image enrichment failed:', error)
  }
}

const backfillMissingTrackImages = async (userId: string): Promise<void> => {
  const rows = await db
    .select({ albumId: tracks.albumId })
    .from(tracks)
    .innerJoin(listens, eq(listens.trackId, tracks.id))
    .where(
      and(
        eq(listens.userId, userId),
        isNull(tracks.imageUrl),
        isNotNull(tracks.albumId),
      ),
    )

  const albumIds = [
    ...new Set(
      rows
        .map((row) => row.albumId)
        .filter((albumId): albumId is string => Boolean(albumId)),
    ),
  ]

  await enrichAlbumImages(userId, albumIds)
}

const updateSyncMetadata = async (
  userId: string,
  result: SyncResult,
  error?: string,
): Promise<void> => {
  await db
    .update(users)
    .set({
      lastSyncedAt: new Date(),
      lastImported: result.imported,
      lastSkipped: result.skipped,
      lastSyncError: error ?? null,
    })
    .where(eq(users.id, userId))
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
  const allArtistIds: string[] = []

  for (const item of data.items) {
    for (const artist of item.track.artists) {
      allArtistIds.push(artist.id)
    }
  }

  await enrichArtists(userId, allArtistIds)

  for (const item of data.items) {
    const track = item.track
    const artistIds = track.artists.map((artist) => artist.id)
    const imageUrl = pickImageUrl(track.album?.images)

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
        imageUrl,
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
          imageUrl,
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

  await backfillMissingTrackImages(userId).catch((error) => {
    console.error('Album image backfill failed:', error)
  })

  await backfillMissingArtistImages(userId).catch((error) => {
    console.error('Artist image backfill failed:', error)
  })

  await backfillMissingArtistGenres(userId).catch((error) => {
    console.error('Artist genre backfill failed:', error)
  })

  const result = {
    imported,
    skipped,
    total: data.items.length,
  }

  await updateSyncMetadata(userId, result)
  return result
}

export const syncUserListeningData = async (userId: string): Promise<SyncResult> => {
  try {
    return await syncRecentlyPlayed(userId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    await updateSyncMetadata(userId, { imported: 0, skipped: 0, total: 0 }, message)
    throw error
  }
}

export const syncAllConnectedUsers = async (): Promise<{
  synced: number
  failed: number
  results: { userId: string; imported: number; error?: string }[]
}> => {
  const tokenRows = await db.query.authTokens.findMany({
    columns: { userId: true },
  })

  const results: { userId: string; imported: number; error?: string }[] = []
  let synced = 0
  let failed = 0

  for (const row of tokenRows) {
    try {
      const result = await syncRecentlyPlayed(row.userId)
      results.push({ userId: row.userId, imported: result.imported })
      synced += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      results.push({ userId: row.userId, imported: 0, error: message })
      failed += 1
    }
  }

  return { synced, failed, results }
}
