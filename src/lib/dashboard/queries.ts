import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'
import {
  aggregateGenres,
  buildDayHourMatrix,
  buildHourlyCounts,
  getPeakHour,
} from '@/lib/dashboard/aggregations'
import {
  jsonEachTrackArtists,
  primaryArtistJoin,
  trackArtistJoin,
} from '@/lib/dashboard/sql-joins'

export interface DashboardTopTrack {
  id: string
  rank: number
  name: string
  artist: string
  plays: number
  imageUrl: string | null
}

export interface DashboardTopArtist {
  id: string
  name: string
  plays: number
  imageUrl: string | null
}

export interface DashboardGenre {
  genre: string
  count: number
}

export interface DashboardData {
  totalListens: number
  uniqueTracks: number
  totalMinutes: number
  recentListens: {
    playedAt: Date
    trackName: string
    trackId: string
    imageUrl: string | null
    artistName: string
  }[]
  topTracks: DashboardTopTrack[]
  topArtists: DashboardTopArtist[]
  genres: DashboardGenre[]
  hourlyCounts: { hour: number; count: number }[]
  dayHourMatrix: { day: number; hour: number; count: number }[]
  peakHour: number | null
  lastSyncedAt: Date | null
}

export const loadDashboardData = async (userId: string): Promise<DashboardData> => {
  const userFilter = eq(listens.userId, userId)

  const userMeta = await db.query.users.findFirst({
    where: (users, { eq: eqFn }) => eqFn(users.id, userId),
    columns: { lastSyncedAt: true },
  })

  const totalListens = await db.$count(listens, userFilter)

  const uniqueTracks = await db
    .select({ count: sql<number>`count(distinct ${listens.trackId})` })
    .from(listens)
    .where(userFilter)
    .then((rows) => rows[0]?.count ?? 0)

  const totalMinutes = await db
    .select({ total: sql<number>`coalesce(sum(${tracks.durationMs}), 0) / 60000` })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .where(userFilter)
    .then((rows) => rows[0]?.total ?? 0)

  const recentListens = await db
    .select({
      playedAt: listens.playedAt,
      trackName: tracks.name,
      trackId: tracks.id,
      imageUrl: tracks.imageUrl,
      artistName: artists.name,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(artists, primaryArtistJoin)
    .where(userFilter)
    .orderBy(desc(listens.playedAt))
    .limit(5)

  const topTracksRaw = await db
    .select({
      trackId: tracks.id,
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
    .limit(10)

  const topTracks: DashboardTopTrack[] = topTracksRaw.map((row, index) => ({
    id: row.trackId,
    rank: index + 1,
    name: row.name,
    artist: row.artistName,
    plays: Number(row.count),
    imageUrl: row.imageUrl,
  }))

  const topArtistsRaw = await db
    .select({
      artistId: artists.id,
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
    .limit(6)

  const topArtists: DashboardTopArtist[] = topArtistsRaw.map((row) => ({
    id: row.artistId,
    name: row.name,
    plays: Number(row.count),
    imageUrl: row.imageUrl,
  }))

  const genreRows = await db
    .select({ genres: artists.genres })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(jsonEachTrackArtists, sql`1=1`)
    .innerJoin(artists, trackArtistJoin)
    .where(userFilter)

  const genres = aggregateGenres(genreRows)

  const listenTimestamps = await db
    .select({ playedAt: listens.playedAt })
    .from(listens)
    .where(userFilter)

  const hourlyCounts = buildHourlyCounts(listenTimestamps)
  const dayHourMatrix = buildDayHourMatrix(listenTimestamps)
  const peakHour = getPeakHour(hourlyCounts)

  return {
    totalListens,
    uniqueTracks,
    totalMinutes,
    recentListens,
    topTracks,
    topArtists,
    genres,
    hourlyCounts,
    dayHourMatrix,
    peakHour,
    lastSyncedAt: userMeta?.lastSyncedAt ?? null,
  }
}
