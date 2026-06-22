import { eq } from 'drizzle-orm'
import { OAuth2RequestError } from 'arctic'

import { db } from '@/db'
import { authTokens } from '@/db/schema'
import { decrypt, encrypt } from '@/lib/crypto/encrypt'
import { createSpotifyOAuth } from '@/lib/spotify/oauth'

const REFRESH_BUFFER_MS = 60_000
const MAX_RETRIES = 3

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getValidAccessToken = async (userId: string): Promise<string> => {
  const rows = await db.select().from(authTokens).where(eq(authTokens.userId, userId))
  const tokenRow = rows[0]

  if (!tokenRow) {
    throw new Error('No Spotify tokens found for user')
  }

  const expiresAt = tokenRow.expiresAt.getTime()
  const needsRefresh = expiresAt - Date.now() < REFRESH_BUFFER_MS

  if (!needsRefresh) {
    return decrypt(tokenRow.accessToken)
  }

  const refreshToken = decrypt(tokenRow.refreshToken)
  const spotify = createSpotifyOAuth()

  try {
    const tokens = await spotify.refreshAccessToken(refreshToken)
    const accessToken = tokens.accessToken()
    const newRefreshToken = tokens.hasRefreshToken()
      ? tokens.refreshToken()
      : refreshToken
    const newExpiresAt = tokens.accessTokenExpiresAt()

    await db
      .update(authTokens)
      .set({
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(newRefreshToken),
        expiresAt: newExpiresAt,
      })
      .where(eq(authTokens.userId, userId))

    return accessToken
  } catch (error) {
    if (error instanceof OAuth2RequestError) {
      throw new Error('Spotify token refresh failed')
    }
    throw error
  }
}

export const spotifyFetch = async (
  userId: string,
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  const accessToken = await getValidAccessToken(userId)
  const url = path.startsWith('https://') ? path : `https://api.spotify.com/v1${path}`

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response
    }

    const retryAfter = response.headers.get('Retry-After')
    const delayMs = retryAfter ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt
    await sleep(delayMs)
  }

  throw new Error('Spotify request failed after retries')
}

interface SpotifyUserProfile {
  id: string
  display_name: string | null
  email?: string
  country: string | null
  product: string | null
}

export const getSpotifyProfile = async (userId: string): Promise<SpotifyUserProfile> => {
  const response = await spotifyFetch(userId, '/me')
  if (!response.ok) {
    throw new Error('Failed to fetch Spotify profile')
  }
  return response.json() as Promise<SpotifyUserProfile>
}
