import { describe, expect, it } from 'vitest'

import { isSpotifyCatalogId } from '@/lib/spotify/catalog'

describe('isSpotifyCatalogId', () => {
  it('accepts real Spotify IDs', () => {
    expect(isSpotifyCatalogId('4Z8W4fKeB5YxbusRsdQVPb')).toBe(true)
  })

  it('rejects demo IDs', () => {
    expect(isSpotifyCatalogId('demo-artist-0')).toBe(false)
  })
})
