import { describe, expect, it } from 'vitest'

import {
  aggregateGenres,
  buildHourlyCounts,
  formatHourLabel,
  getPeakHour,
} from '@/lib/dashboard/aggregations'

describe('aggregateGenres', () => {
  it('counts unique genres per listen row', () => {
    const result = aggregateGenres([
      { genres: ['pop', 'dance'] },
      { genres: ['pop'] },
      { genres: ['rock'] },
    ])

    expect(result).toEqual([
      { genre: 'pop', count: 2 },
      { genre: 'dance', count: 1 },
      { genre: 'rock', count: 1 },
    ])
  })

  it('returns empty array for no genres', () => {
    expect(aggregateGenres([])).toEqual([])
  })
})

describe('buildHourlyCounts', () => {
  it('groups listens by hour', () => {
    const rows = [
      { playedAt: new Date('2024-06-01T14:00:00') },
      { playedAt: new Date('2024-06-01T14:30:00') },
      { playedAt: new Date('2024-06-01T09:00:00') },
    ]

    const counts = buildHourlyCounts(rows)
    expect(counts[14].count).toBe(2)
    expect(counts[9].count).toBe(1)
    expect(counts[0].count).toBe(0)
  })
})

describe('getPeakHour', () => {
  it('returns null when all hours are zero', () => {
    const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
    expect(getPeakHour(hourly)).toBeNull()
  })

  it('returns the hour with highest count', () => {
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hour === 21 ? 10 : 1,
    }))
    expect(getPeakHour(hourly)).toBe(21)
  })
})

describe('formatHourLabel', () => {
  it('formats midnight and noon', () => {
    expect(formatHourLabel(0)).toBe('12 AM')
    expect(formatHourLabel(12)).toBe('12 PM')
    expect(formatHourLabel(15)).toBe('3 PM')
  })
})
