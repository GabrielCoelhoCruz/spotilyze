import { generateState } from 'arctic'
import { NextResponse } from 'next/server'

import { setOAuthState } from '@/lib/crypto/state'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { SPOTIFY_SCOPES } from '@/lib/spotify/config'
import { createSpotifyOAuth } from '@/lib/spotify/oauth'

export const GET = async (request: Request): Promise<NextResponse> => {
  const ip = getClientIp(request)
  const limit = checkRateLimit(`auth-login:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const spotify = createSpotifyOAuth()
    const state = generateState()
    const url = spotify.createAuthorizationURL(state, null, [...SPOTIFY_SCOPES])

    await setOAuthState(state)

    return NextResponse.redirect(url.toString())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start OAuth flow'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
