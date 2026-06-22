import { NextResponse } from 'next/server'
import { db } from '@/db'
import { artists, dailyStats, listens, tracks, users } from '@/db/schema'
import { computeDailyStats, generateDemoData } from '@/lib/demo-data'

export const POST = async (): Promise<NextResponse> => {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Demo data is only available in development mode' }, { status: 403 })
  }

  try {
    const { user, artists: demoArtists, tracks: demoTracks, listens: demoListens } = generateDemoData()

    db.insert(users).values([user]).onConflictDoNothing().run()

    if (demoArtists.length > 0) {
      db.insert(artists).values(demoArtists).onConflictDoNothing().run()
    }

    if (demoTracks.length > 0) {
      db.insert(tracks).values(demoTracks).onConflictDoNothing().run()
    }

    if (demoListens.length > 0) {
      db.insert(listens).values(demoListens).onConflictDoNothing().run()
    }

    const stats = computeDailyStats(demoListens, demoTracks, demoArtists)
    if (stats.length > 0) {
      db.insert(dailyStats).values(stats).onConflictDoNothing().run()
    }

    return NextResponse.json({
      success: true,
      seeded: {
        listens: demoListens.length,
        tracks: demoTracks.length,
        artists: demoArtists.length,
        days: stats.length,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
