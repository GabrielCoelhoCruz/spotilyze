import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/session'
import { syncUserListeningData } from '@/lib/spotify/sync'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const POST = async (request: Request): Promise<NextResponse> => {
  const ip = getClientIp(request)
  const limit = checkRateLimit(`sync:${ip}`, 5, 60_000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const result = await syncUserListeningData(user.id)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
