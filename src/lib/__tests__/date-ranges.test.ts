import { describe, it, expect } from 'vitest'
import { formatDateKey, getDateRange, eachDay } from '../date-ranges'

describe('date-ranges', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date('2026-06-22T12:00:00Z'))).toBe('2026-06-22')
  })

  it('returns a range covering the requested number of days', () => {
    const { start, end } = getDateRange(7)
    const diffMs = end.getTime() - start.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(6 * 24 * 60 * 60 * 1000)
    expect(diffMs).toBeLessThan(8 * 24 * 60 * 60 * 1000)
  })

  it('enumerates each day between two dates inclusively', () => {
    const start = new Date('2026-06-20')
    const end = new Date('2026-06-22')
    const days = eachDay(start, end)
    expect(days).toHaveLength(3)
    expect(days.map(formatDateKey)).toEqual([
      '2026-06-20',
      '2026-06-21',
      '2026-06-22',
    ])
  })
})
