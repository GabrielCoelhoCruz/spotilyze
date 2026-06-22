import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'
import {
  aggregateGenres,
  buildHourlyCounts,
  formatHourLabel,
  getPeakHour,
} from '@/lib/dashboard/aggregations'
import {
  jsonEachTrackArtists,
  primaryArtistJoin,
  trackArtistJoin,
} from '@/lib/dashboard/sql-joins'

export interface WrappedSnapshot {
  totalListens: number
  uniqueTracks: number
  uniqueArtists: number
  totalMinutes: number
  topTrack: { name: string; artist: string; plays: number; imageUrl: string | null } | null
  topArtist: { name: string; plays: number; imageUrl: string | null } | null
  topGenre: string | null
  peakHour: number | null
  peakHourLabel: string | null
  busiestDay: { date: string; count: number } | null
}

export const loadWrappedSnapshot = async (userId: string): Promise<WrappedSnapshot> => {
  const userFilter = eq(listens.userId, userId)

  const totalListens = await db.$count(listens, userFilter)

  const uniqueTracks = await db
    .select({ count: sql<number>`count(distinct ${listens.trackId})` })
    .from(listens)
    .where(userFilter)
    .then((rows) => rows[0]?.count ?? 0)

  const uniqueArtists = await db
    .select({ count: sql<number>`count(distinct ${artists.id})` })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(artists, primaryArtistJoin)
    .where(userFilter)
    .then((rows) => rows[0]?.count ?? 0)

  const totalMinutes = await db
    .select({ total: sql<number>`coalesce(sum(${tracks.durationMs}), 0) / 60000` })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .where(userFilter)
    .then((rows) => rows[0]?.total ?? 0)

  const [topTrackRow] = await db
    .select({
      name: tracks.name,
      artistName: artists.name,
      imageUrl: tracks.imageUrl,
      count: sql<number>`count(${listens.id})`,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(artists, primaryArtistJoin)
    .where(userFilter)
    .groupBy(tracks.id, tracks.name, tracks.imageUrl, artists.name)
    .orderBy(desc(sql<number>`count(${listens.id})`))
    .limit(1)

  const [topArtistRow] = await db
    .select({
      name: artists.name,
      imageUrl: artists.imageUrl,
      count: sql<number>`count(${listens.id})`,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(jsonEachTrackArtists, sql`1=1`)
    .innerJoin(artists, trackArtistJoin)
    .where(userFilter)
    .groupBy(artists.id, artists.name, artists.imageUrl)
    .orderBy(desc(sql<number>`count(${listens.id})`))
    .limit(1)

  const genreRows = await db
    .select({ genres: artists.genres })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(jsonEachTrackArtists, sql`1=1`)
    .innerJoin(artists, trackArtistJoin)
    .where(userFilter)

  const genres = aggregateGenres(genreRows)
  const topGenre = genres[0]?.genre ?? null

  const listenTimestamps = await db
    .select({ playedAt: listens.playedAt })
    .from(listens)
    .where(userFilter)

  const hourlyCounts = buildHourlyCounts(listenTimestamps)
  const peakHour = getPeakHour(hourlyCounts)

  const dayCounts = new Map<string, number>()
  for (const row of listenTimestamps) {
    const key = row.playedAt.toISOString().slice(0, 10)
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1)
  }

  let busiestDay: { date: string; count: number } | null = null
  for (const [date, count] of dayCounts) {
    if (!busiestDay || count > busiestDay.count) {
      busiestDay = { date, count }
    }
  }

  return {
    totalListens,
    uniqueTracks,
    uniqueArtists,
    totalMinutes: Math.round(totalMinutes),
    topTrack: topTrackRow
      ? {
          name: topTrackRow.name,
          artist: topTrackRow.artistName,
          plays: Number(topTrackRow.count),
          imageUrl: topTrackRow.imageUrl,
        }
      : null,
    topArtist: topArtistRow
      ? {
          name: topArtistRow.name,
          plays: Number(topArtistRow.count),
          imageUrl: topArtistRow.imageUrl,
        }
      : null,
    topGenre,
    peakHour,
    peakHourLabel: peakHour !== null ? formatHourLabel(peakHour) : null,
    busiestDay,
  }
}
