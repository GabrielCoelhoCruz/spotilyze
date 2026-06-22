import { generateState } from 'arctic'
import { NextResponse } from 'next/server'

import { setOAuthState } from '@/lib/crypto/state'
import { SPOTIFY_SCOPES } from '@/lib/spotify/config'
import { createSpotifyOAuth } from '@/lib/spotify/oauth'

export const GET = async (): Promise<NextResponse> => {
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
