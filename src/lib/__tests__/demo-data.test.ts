import { describe, it, expect } from 'vitest'
import { computeDailyStats, generateDemoData } from '../demo-data'

describe('demo-data', () => {
  it('generates demo data for 90 days by default', () => {
    const data = generateDemoData()
    expect(data.artists.length).toBeGreaterThan(0)
    expect(data.tracks.length).toBeGreaterThan(0)
    expect(data.listens.length).toBeGreaterThan(0)

    const firstListen = data.listens[0]
    const lastListen = data.listens[data.listens.length - 1]
    const diffDays = (lastListen.playedAt.getTime() - firstListen.playedAt.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(80)
  })

  it('computes daily stats from generated listens', () => {
    const { artists, tracks, listens } = generateDemoData(7)
    const stats = computeDailyStats(listens, tracks, artists)
    expect(stats.length).toBeGreaterThan(0)

    const firstDay = stats[0]
    expect(firstDay.trackCount).toBeGreaterThan(0)
    expect(firstDay.uniqueTracks).toBeGreaterThan(0)
    expect(firstDay.totalMinutes).toBeGreaterThan(0)
  })
})
