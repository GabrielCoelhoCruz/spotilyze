import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { listens, tracks, users } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/session'
import { parseExtendedStreamingHistory, extractTrackUri, type ExtendedStreamingSong } from '@/lib/spotify/extended-history'

const BATCH_SIZE = 100

const processImportBatch = async (
  userId: string,
  songs: ExtendedStreamingSong[],
): Promise<{ imported: number; skipped: number }> => {
  let imported = 0
  let skipped = 0

  for (const song of songs) {
    const trackUri = extractTrackUri(song.spotify_track_uri)
    if (!trackUri) {
      skipped++
      continue
    }

    const trackName = song.master_metadata_track_name ?? 'Unknown Track'
    const artistName = song.master_metadata_album_artist_name ?? 'Unknown Artist'
    const albumName = song.master_metadata_album_album_name ?? null

    await db
      .insert(tracks)
      .values({
        id: trackUri,
        name: trackName,
        artistIds: [],
        albumId: null,
        durationMs: song.ms_played,
        popularity: null,
        explicit: false,
        previewUrl: null,
        imageUrl: null,
        externalUrls: null,
      })
      .onConflictDoNothing()

    const playedAt = new Date(song.ts)
    const insertResult = db
      .insert(listens)
      .values({
        userId,
        trackId: trackUri,
        playedAt,
        contextType: null,
        contextUri: null,
        source: 'extended_history',
      })
      .onConflictDoNothing()
      .run()

    if (insertResult.changes > 0) {
      imported++
    } else {
      skipped++
    }
  }

  return { imported, skipped }
}

export const POST = async (request: Request): Promise<NextResponse> => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'File must be a JSON' }, { status: 400 })
    }

    const text = await file.text()
    const data = JSON.parse(text)

    const history = parseExtendedStreamingHistory(data)
    const songs = history.library.music.songs

    let totalImported = 0
    let totalSkipped = 0

    for (let i = 0; i < songs.length; i += BATCH_SIZE) {
      const batch = songs.slice(i, i + BATCH_SIZE)
      const result = await processImportBatch(user.id, batch)
      totalImported += result.imported
      totalSkipped += result.skipped
    }

    await db
      .update(users)
      .set({
        lastSyncedAt: new Date(),
        lastImported: totalImported,
        lastSkipped: totalSkipped,
        lastSyncError: null,
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({
      success: true,
      imported: totalImported,
      skipped: totalSkipped,
      total: songs.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
