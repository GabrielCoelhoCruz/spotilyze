/** Spotify artist/album/track IDs are 22-char base62 strings. */
export const isSpotifyCatalogId = (id: string): boolean => /^[0-9A-Za-z]{22}$/.test(id)
