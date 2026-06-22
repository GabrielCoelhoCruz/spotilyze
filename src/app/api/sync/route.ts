import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/session'
import { syncUserListeningData } from '@/lib/spotify/sync'

export const POST = async (): Promise<NextResponse> => {
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
