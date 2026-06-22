export interface GenreCount {
  genre: string
  count: number
}

export interface HourlyCount {
  hour: number
  count: number
}

export interface DayHourCell {
  day: number
  hour: number
  count: number
}

export const aggregateGenres = (
  rows: { genres: string[] }[],
): GenreCount[] => {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const uniqueGenres = [...new Set(row.genres.filter(Boolean))]
    for (const genre of uniqueGenres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
}

export const buildHourlyCounts = (
  rows: { playedAt: Date }[],
): HourlyCount[] => {
  const counts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))

  for (const row of rows) {
    const hour = row.playedAt.getHours()
    counts[hour].count += 1
  }

  return counts
}

export const buildDayHourMatrix = (
  rows: { playedAt: Date }[],
): DayHourCell[] => {
  const matrix = new Map<string, number>()

  for (const row of rows) {
    const day = row.playedAt.getDay()
    const hour = row.playedAt.getHours()
    const key = `${day}-${hour}`
    matrix.set(key, (matrix.get(key) ?? 0) + 1)
  }

  return [...matrix.entries()].map(([key, count]) => {
    const [day, hour] = key.split('-').map(Number)
    return { day, hour, count }
  })
}

export const getPeakHour = (hourly: HourlyCount[]): number | null => {
  if (hourly.every((h) => h.count === 0)) return null
  return hourly.reduce((peak, current) =>
    current.count > peak.count ? current : peak,
  ).hour
}

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

export const GENRE_COLORS = [
  '#1DB954',
  '#1ed760',
  '#169c46',
  '#535353',
  '#b3b3b3',
  '#2d46b9',
  '#8c67ab',
  '#e8115b',
] as const
