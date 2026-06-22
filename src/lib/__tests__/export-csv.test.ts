import { describe, expect, it } from 'vitest'

import { buildCsvContent, escapeCsvField } from '@/lib/export/csv'

describe('escapeCsvField', () => {
  it('wraps fields containing commas in quotes', () => {
    expect(escapeCsvField('hello, world')).toBe('"hello, world"')
  })

  it('escapes double quotes', () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""')
  })
})

describe('buildCsvContent', () => {
  it('builds CSV with header and rows', () => {
    const csv = buildCsvContent([
      {
        playedAt: new Date('2024-01-15T12:00:00.000Z'),
        trackName: 'Test Track',
        artistName: 'Test Artist',
        durationMs: 180000,
        source: 'spotify',
      },
    ])

    expect(csv).toContain('played_at,track,artist,duration_ms,source')
    expect(csv).toContain('Test Track')
    expect(csv).toContain('Test Artist')
    expect(csv).toContain('180000')
  })
})
