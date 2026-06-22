import { sql } from 'drizzle-orm'

import { artists, tracks } from '@/db/schema'

/** First credited artist on a track (legacy / display label). */
export const primaryArtistJoin = sql`${artists.id} = json_extract(${tracks.artistIds}, '$[0]')`

/** Expands every artist id stored on a track (for accurate top-artist counts). */
export const jsonEachTrackArtists = sql`json_each(${tracks.artistIds}) as track_artist`

export const trackArtistJoin = sql`${artists.id} = track_artist.value`
