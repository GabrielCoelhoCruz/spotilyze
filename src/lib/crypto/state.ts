import { cookies } from 'next/headers'

const OAUTH_STATE_COOKIE = 'spotify_oauth_state'
const SESSION_COOKIE = 'spotify_session'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const setOAuthState = async (state: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    ...cookieOptions,
    maxAge: 60 * 10,
  })
}

export const getOAuthState = async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get(OAUTH_STATE_COOKIE)?.value
}

export const clearOAuthState = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(OAUTH_STATE_COOKIE)
}

export const setSession = async (userId: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  })
}

export const getSessionUserId = async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export const clearSession = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
