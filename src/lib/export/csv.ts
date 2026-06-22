import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'

export interface CsvListenRow {
  playedAt: Date
  trackName: string
  artistName: string
  durationMs: number | null
  source: string
}

export const escapeCsvField = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export const buildCsvContent = (rows: CsvListenRow[]): string => {
  const header = 'played_at,track,artist,duration_ms,source'
  const lines = rows.map((row) =>
    [
      escapeCsvField(row.playedAt.toISOString()),
      escapeCsvField(row.trackName),
      escapeCsvField(row.artistName),
      row.durationMs?.toString() ?? '',
      escapeCsvField(row.source),
    ].join(','),
  )
  return [header, ...lines].join('\n')
}

export const fetchListenRowsForExport = async (userId: string): Promise<CsvListenRow[]> => {
  const rows = await db
    .select({
      playedAt: listens.playedAt,
      trackName: tracks.name,
      artistName: artists.name,
      durationMs: tracks.durationMs,
      source: listens.source,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(
      artists,
      sql`${artists.id} = json_extract(${tracks.artistIds}, '$[0]')`,
    )
    .where(eq(listens.userId, userId))
    .orderBy(desc(listens.playedAt))

  return rows.map((row) => ({
    playedAt: row.playedAt,
    trackName: row.trackName,
    artistName: row.artistName ?? 'Unknown',
    durationMs: row.durationMs,
    source: row.source,
  }))
}
