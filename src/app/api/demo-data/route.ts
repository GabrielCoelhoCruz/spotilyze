import { NextResponse } from 'next/server'

import { seedDemoData } from '@/lib/demo-data'

export const POST = async (): Promise<NextResponse> => {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Demo data is only available in development mode' }, { status: 403 })
  }

  try {
    const seeded = seedDemoData()
    return NextResponse.json({ success: true, seeded })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
