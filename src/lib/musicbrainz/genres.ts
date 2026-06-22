const USER_AGENT = 'Spotilyze/1.0 (https://github.com/spotilyze)'
const RATE_LIMIT_MS = 1100

let lastRequestAt = 0

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const throttle = async (): Promise<void> => {
  const now = Date.now()
  const wait = Math.max(0, lastRequestAt + RATE_LIMIT_MS - now)
  if (wait > 0) await sleep(wait)
  lastRequestAt = Date.now()
}

const mbFetch = async (url: string): Promise<Response> => {
  await throttle()
  return fetch(url, { headers: { 'User-Agent': USER_AGENT } })
}

const TAG_DENYLIST = new Set([
  '2010s',
  '2020s',
  '2000s',
  '1990s',
  'female vocals',
  'male vocals',
  'girl group',
  'boy group',
  'south korea',
  'korean',
])

const normalizeGenre = (value: string): string => value.trim().toLowerCase()

const pickGenres = (
  genres: { name: string }[] | undefined,
  tags: { name: string; count: number }[] | undefined,
): string[] => {
  const fromGenres = (genres ?? []).map((g) => normalizeGenre(g.name)).filter(Boolean)
  if (fromGenres.length > 0) return [...new Set(fromGenres)].slice(0, 5)

  const fromTags = (tags ?? [])
    .sort((a, b) => b.count - a.count)
    .map((t) => normalizeGenre(t.name))
    .filter((name) => name && !TAG_DENYLIST.has(name))

  return [...new Set(fromTags)].slice(0, 5)
}

const inferLocalGenreFallback = (artistName: string): string[] => {
  const trimmed = artistName.trim()
  if (/^(mc|dj)\s/i.test(trimmed)) {
    return ['funk', 'brazilian funk']
  }
  return []
}

export const inferGenreFallback = inferLocalGenreFallback

export const extractGenresFromMusicBrainz = pickGenres

export const lookupGenresForArtist = async (artistName: string): Promise<string[]> => {
  try {
    const searchRes = await mbFetch(
      `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(`artist:"${artistName}"`)}&fmt=json&limit=3`,
    )
    if (!searchRes.ok) return inferLocalGenreFallback(artistName)

    const searchData = (await searchRes.json()) as {
      artists?: { id: string; name: string; score: number }[]
    }

    const match =
      searchData.artists?.find(
        (artist) => artist.name.localeCompare(artistName, undefined, { sensitivity: 'accent' }) === 0,
      ) ?? searchData.artists?.[0]

    if (!match) return inferLocalGenreFallback(artistName)

    const artistRes = await mbFetch(
      `https://musicbrainz.org/ws/2/artist/${match.id}?inc=genres+tags&fmt=json`,
    )
    if (!artistRes.ok) return inferLocalGenreFallback(artistName)

    const artist = (await artistRes.json()) as {
      genres?: { name: string }[]
      tags?: { name: string; count: number }[]
    }

    const genres = pickGenres(artist.genres, artist.tags)
    if (genres.length > 0) return genres

    return inferLocalGenreFallback(artistName)
  } catch (error) {
    console.error(`MusicBrainz genre lookup failed for ${artistName}:`, error)
    return inferLocalGenreFallback(artistName)
  }
}
