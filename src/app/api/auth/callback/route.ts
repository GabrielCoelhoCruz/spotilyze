import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { OAuth2RequestError } from 'arctic'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { authTokens, users } from '@/db/schema'
import { encrypt } from '@/lib/crypto/encrypt'
import { clearOAuthState, getOAuthState, setSession } from '@/lib/crypto/state'
import { SPOTIFY_SCOPES } from '@/lib/spotify/config'
import { createSpotifyOAuth } from '@/lib/spotify/oauth'
import { syncUserListeningData } from '@/lib/spotify/sync'

interface SpotifyProfile {
  id: string
  display_name: string | null
  country: string | null
  product: string | null
  email?: string
}

export const GET = async (request: Request): Promise<NextResponse> => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url))
  }

  const storedState = await getOAuthState()
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }

  await clearOAuthState()

  const spotify = createSpotifyOAuth()

  try {
    const tokens = await spotify.validateAuthorizationCode(code, null)
    const accessToken = tokens.accessToken()
    const refreshToken = tokens.refreshToken()
    const expiresAt = tokens.accessTokenExpiresAt()

    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileResponse.ok) {
      return NextResponse.redirect(new URL('/?error=profile_fetch_failed', request.url))
    }

    const profile = (await profileResponse.json()) as SpotifyProfile
    const existingUsers = await db.select().from(users).where(eq(users.spotifyId, profile.id))
    const existingUser = existingUsers[0]
    const userId = existingUser?.id ?? randomUUID()

    if (!existingUser) {
      await db.insert(users).values({
        id: userId,
        spotifyId: profile.id,
        displayName: profile.display_name,
        country: profile.country,
        product: profile.product,
      })
    } else {
      await db
        .update(users)
        .set({
          displayName: profile.display_name,
          country: profile.country,
          product: profile.product,
        })
        .where(eq(users.id, existingUser.id))
    }

    const scope = [...SPOTIFY_SCOPES].join(' ')

    await db
      .insert(authTokens)
      .values({
        userId,
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        expiresAt,
        scope,
      })
      .onConflictDoUpdate({
        target: authTokens.userId,
        set: {
          accessToken: encrypt(accessToken),
          refreshToken: encrypt(refreshToken),
          expiresAt,
          scope,
        },
      })

    await setSession(userId)

    try {
      await syncUserListeningData(userId)
    } catch (syncError) {
      console.error('Initial sync after login failed:', syncError)
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (callbackError) {
    if (callbackError instanceof OAuth2RequestError) {
      const code = callbackError.code ?? 'oauth_error'
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(code)}`, request.url))
    }

    console.error('OAuth callback error:', callbackError)
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}
