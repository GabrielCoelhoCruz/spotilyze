import { NextResponse } from 'next/server'

import { runAutoSync, verifyCronAuth } from '@/lib/spotify/auto-sync'

export const GET = async (request: Request): Promise<NextResponse> => {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runAutoSync()
    if (!result) {
      return NextResponse.json({ success: true, message: 'Sync already in progress' })
    }
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const POST = GET
