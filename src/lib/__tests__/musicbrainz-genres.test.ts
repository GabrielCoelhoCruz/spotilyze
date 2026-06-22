import { describe, expect, it } from 'vitest'

import { extractGenresFromMusicBrainz } from '@/lib/musicbrainz/genres'

describe('extractGenresFromMusicBrainz', () => {
  it('prefers curated genres and filters noisy tags', () => {
    const genres = extractGenresFromMusicBrainz(
      [
        { name: 'k-pop' },
        { name: 'pop' },
      ],
      [
        { name: 'k-pop', count: 11 },
        { name: '2010s', count: 5 },
        { name: 'girl group', count: 4 },
        { name: 'hip hop', count: 1 },
      ],
    )

    expect(genres).toEqual(['k-pop', 'pop'])
  })
})
