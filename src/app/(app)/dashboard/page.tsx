import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { Music2 } from 'lucide-react'

import {
  DashboardContent,
  DashboardEmptyPanel,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-content'
import { db } from '@/db'
import { listens } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/session'
import { loadDashboardData } from '@/lib/dashboard/queries'
import { triggerStaleUserSync } from '@/lib/spotify/auto-sync'
import { syncUserListeningData } from '@/lib/spotify/sync'
import { DemoButton } from './demo-button'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="space-y-10">
        <DashboardPageHeader
          title="Dashboard"
          subtitle="Connect Spotify to unlock your listening profile — or explore with demo data."
        />
        <DashboardEmptyPanel
          icon={<Music2 className="size-6 text-spotify" />}
          title="Not connected"
          description="Link your Spotify account to track plays, surface top artists, and review your listening history. No account? Try the public demo."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/api/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-spotify px-5 text-sm font-semibold text-spotify-foreground transition-all hover:brightness-110"
              >
                Connect Spotify
              </Link>
              <Link
                href="/demo/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Try demo
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  let listenCount = await db.$count(listens, eq(listens.userId, user.id))

  if (listenCount === 0) {
    try {
      await syncUserListeningData(user.id)
      listenCount = await db.$count(listens, eq(listens.userId, user.id))
    } catch (error) {
      console.error('Dashboard auto-sync failed:', error)
    }
  } else {
    triggerStaleUserSync(user.id, user.lastSyncedAt)
  }

  const data = await loadDashboardData(user.id)

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 flex justify-end">
          <DemoButton />
        </div>
      )}
      <DashboardContent
        data={data}
        displayName={user.displayName ?? 'listener'}
      />
    </>
  )
}
