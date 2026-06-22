import { eachDay, formatDateKey, getDateRange } from './date-ranges'

export const DEMO_USER_ID = 'demo-user'

const ARTIST_POOL = [
  { name: 'The Midnight', genres: ['synthwave', 'electronic'] },
  { name: 'Synthwave Goose', genres: ['synthwave', 'retrowave'] },
  { name: 'Neon Dreams', genres: ['electronic', 'pop'] },
  { name: 'Indie Bloom', genres: ['indie', 'alternative'] },
  { name: 'Jazz Canvas', genres: ['jazz', 'lo-fi'] },
  { name: 'Lo-Fi Study Girl', genres: ['lo-fi', 'chillhop'] },
  { name: 'Rock Falcons', genres: ['rock', 'alternative'] },
  { name: 'Pop Prism', genres: ['pop', 'dance'] },
  { name: 'Deep Focus', genres: ['ambient', 'electronic'] },
  { name: 'Acoustic Morning', genres: ['acoustic', 'folk'] },
  { name: 'Hip-Hop Heads', genres: ['hip-hop', 'rap'] },
  { name: 'Classical Currents', genres: ['classical', 'focus'] },
]

const TRACK_TITLES = [
  'Neon Horizon',
  'Midnight City',
  'Shadows Fade',
  'Electric Heart',
  'Lost in Time',
  'Dream Runner',
  'Crystal Waves',
  'Last Summer',
  'Moonlight Drive',
  'Retrograde',
  'Sunset Boulevard',
  'Nightcall',
  'Ocean Eyes',
  'Starlight',
  'Velvet Sky',
  'Daybreak',
  'Ghost Voices',
  'Solaris',
  'After Hours',
  'Pure Shores',
]

export interface DemoArtist {
  id: string
  name: string
  genres: string[]
  popularity: number
  followers: number
  imageUrl: string | null
}

export interface DemoTrack {
  id: string
  name: string
  artistIds: string[]
  albumId: string | null
  durationMs: number
  popularity: number
  explicit: boolean
  previewUrl: string | null
  externalUrls: Record<string, string>
}

export interface DemoListen {
  userId: string
  trackId: string
  playedAt: Date
  contextType: string | null
  contextUri: string | null
  source: string
}

export interface DemoData {
  user: { id: string; spotifyId: string; displayName: string; country: string; product: string }
  artists: DemoArtist[]
  tracks: DemoTrack[]
  listens: DemoListen[]
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

export const generateDemoData = (days = 90): DemoData => {
  const user = {
    id: DEMO_USER_ID,
    spotifyId: 'demo-spotify-id',
    displayName: 'Demo User',
    country: 'US',
    product: 'premium',
  }

  const artists: DemoArtist[] = ARTIST_POOL.map((artist, index) => ({
    id: `demo-artist-${index}`,
    name: artist.name,
    genres: artist.genres,
    popularity: randomInt(40, 95),
    followers: randomInt(10000, 5000000),
    imageUrl: null,
  }))

  const tracks: DemoTrack[] = Array.from({ length: 40 }, (_, index) => {
    const artistCount = Math.random() > 0.85 ? 2 : 1
    const artistIds = Array.from({ length: artistCount }, () => pick(artists).id)
    const durationMs = randomInt(120000, 300000)
    return {
      id: `demo-track-${index}`,
      name: `${pick(TRACK_TITLES)} ${index + 1}`,
      artistIds: Array.from(new Set(artistIds)),
      albumId: `demo-album-${randomInt(0, 9)}`,
      durationMs,
      popularity: randomInt(30, 95),
      explicit: Math.random() > 0.9,
      previewUrl: null,
      externalUrls: { spotify: `https://open.spotify.com/track/demo-track-${index}` },
    }
  })

  const { start, end } = getDateRange(days)
  const dayList = eachDay(start, end)

  const listens: DemoListen[] = []
  dayList.forEach((day) => {
    const dayOfWeek = day.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseSessionCount = isWeekend ? randomInt(3, 6) : randomInt(1, 4)

    for (let session = 0; session < baseSessionCount; session++) {
      const sessionHour = randomInt(7, 23)
      const tracksInSession = randomInt(3, 12)

      for (let i = 0; i < tracksInSession; i++) {
        const playedAt = new Date(day)
        playedAt.setHours(sessionHour, randomInt(0, 59), randomInt(0, 59), randomInt(0, 999))
        if (playedAt > end) continue

        listens.push({
          userId: user.id,
          trackId: pick(tracks).id,
          playedAt,
          contextType: Math.random() > 0.5 ? 'playlist' : 'album',
          contextUri: `spotify:${Math.random() > 0.5 ? 'playlist' : 'album'}:demo-${randomInt(1, 5)}`,
          source: 'spotify',
        })
      }
    }
  })

  listens.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime())

  return { user, artists, tracks, listens }
}

export const computeDailyStats = (listens: DemoListen[], tracks: DemoTrack[], artists: DemoArtist[]) => {
  const statsByDay = new Map<string, {
    trackCount: number
    uniqueTracks: Set<string>
    uniqueArtists: Set<string>
    totalMinutes: number
    genreCounts: Map<string, number>
  }>()

  listens.forEach((listen) => {
    const dateKey = formatDateKey(listen.playedAt)
    const track = tracks.find((t) => t.id === listen.trackId)
    if (!track) return

    const day = statsByDay.get(dateKey) ?? {
      trackCount: 0,
      uniqueTracks: new Set<string>(),
      uniqueArtists: new Set<string>(),
      totalMinutes: 0,
      genreCounts: new Map<string, number>(),
    }

    day.trackCount += 1
    day.uniqueTracks.add(listen.trackId)
    track.artistIds.forEach((artistId) => {
      day.uniqueArtists.add(artistId)
      const artist = artists.find((a) => a.id === artistId)
      artist?.genres.forEach((genre) => {
        day.genreCounts.set(genre, (day.genreCounts.get(genre) ?? 0) + 1)
      })
    })
    day.totalMinutes += Math.round(track.durationMs / 60000)

    statsByDay.set(dateKey, day)
  })

  return Array.from(statsByDay.entries()).map(([date, day]) => {
    let topGenre: string | null = null
    let topCount = 0
    day.genreCounts.forEach((count, genre) => {
      if (count > topCount) {
        topCount = count
        topGenre = genre
      }
    })

    return {
      userId: DEMO_USER_ID,
      date,
      trackCount: day.trackCount,
      uniqueTracks: day.uniqueTracks.size,
      uniqueArtists: day.uniqueArtists.size,
      topGenre,
      totalMinutes: day.totalMinutes,
    }
  })
}
