import Link from 'next/link'
import { desc, eq, sql } from 'drizzle-orm'
import { BarChart3, Clock, Headphones, Music2, TrendingUp } from 'lucide-react'

import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/session'
import { syncUserListeningData } from '@/lib/spotify/sync'
import { DemoButton } from './demo-button'
import { SyncButton } from './sync-button'

const loadDashboardData = async (userId: string) => {
  const userFilter = eq(listens.userId, userId)

  const totalListens = await db.$count(listens, userFilter)

  const uniqueTracks = await db
    .select({ count: sql<number>`count(distinct ${listens.trackId})` })
    .from(listens)
    .where(userFilter)
    .then((rows) => rows[0]?.count ?? 0)

  const totalMinutes = await db
    .select({ total: sql<number>`sum(${tracks.durationMs}) / 60000` })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .where(userFilter)
    .then((rows) => rows[0]?.total ?? 0)

  const recentListens = await db
    .select({
      playedAt: listens.playedAt,
      trackName: tracks.name,
      trackId: tracks.id,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .where(userFilter)
    .orderBy(desc(listens.playedAt))
    .limit(5)

  const topArtists = await db
    .select({
      artistId: artists.id,
      name: artists.name,
      count: sql<number>`count(${listens.id})`,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .innerJoin(artists, sql`${artists.id} = json_extract(${tracks.artistIds}, '$[0]')`)
    .where(userFilter)
    .groupBy(artists.id, artists.name)
    .orderBy(desc(sql<number>`count(${listens.id})`))
    .limit(5)

  return { totalListens, uniqueTracks, totalMinutes, recentListens, topArtists }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="space-y-10">
        <PageHeader
          title="Dashboard"
          subtitle="Connect Spotify to unlock your listening profile."
        />
        <EmptyPanel
          icon={<Music2 className="size-6 text-spotify" />}
          title="Not connected"
          description="Link your Spotify account to track plays, surface top artists, and review your listening history in one editorial dashboard."
          action={
            <Link
              href="/api/auth/login"
              className="inline-flex h-11 items-center rounded-xl bg-spotify px-5 text-sm font-semibold text-spotify-foreground transition-all hover:brightness-110"
            >
              Connect Spotify
            </Link>
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
  }

  const { totalListens, uniqueTracks, totalMinutes, recentListens, topArtists } =
    await loadDashboardData(user.id)
  const hasData = totalListens > 0

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Dashboard"
          subtitle={
            <>
              Welcome back,{' '}
              <span className="font-medium text-foreground">
                {user.displayName ?? 'listener'}
              </span>
              . Your listening activity at a glance.
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <SyncButton />
          {process.env.NODE_ENV === 'development' && <DemoButton />}
        </div>
      </div>

      {!hasData && (
        <EmptyPanel
          icon={<Headphones className="size-6 text-spotify" />}
          title="No listening data yet"
          description="Spotify exposes your last ~50 plays. Hit sync to pull them now — it only takes a moment."
          action={<SyncButton />}
        />
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
            <MetricCard
              icon={<Headphones className="size-4 text-spotify" />}
              label="Total listens"
              value={totalListens.toLocaleString()}
              emphasized
            />
            <MetricCard
              icon={<BarChart3 className="size-4 text-muted-foreground" />}
              label="Unique tracks"
              value={uniqueTracks.toLocaleString()}
            />
            <MetricCard
              icon={<Clock className="size-4 text-muted-foreground" />}
              label="Minutes listened"
              value={Math.round(totalMinutes).toLocaleString()}
            />
          </div>

          <div className="surface-editorial overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h3 className="text-sm font-semibold tracking-tight">Listening intensity</h3>
              <span className="rounded-full bg-spotify/10 px-2.5 py-0.5 text-xs font-medium text-spotify">
                {recentListens.length} recent
              </span>
            </div>
            <div className="flex items-end gap-1.5 px-6 py-6">
              {[42, 68, 55, 91, 73, 88, 47].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-md bg-spotify/20 transition-colors hover:bg-spotify/35"
                  style={{ height: `${height}px` }}
                  aria-hidden
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="surface-editorial overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <h3 className="text-sm font-semibold tracking-tight">Recent listens</h3>
                <span className="text-xs text-muted-foreground">{recentListens.length} tracks</span>
              </div>
              <ul className="divide-y divide-border/60">
                {recentListens.map((listen, index) => (
                  <li
                    key={`${listen.trackId}-${index}`}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground w-5 shrink-0 text-right tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/60">
                        <Music2 className="size-4 text-muted-foreground" />
                      </div>
                      <span className="truncate text-sm font-medium">{listen.trackName}</span>
                    </div>
                    <time
                      dateTime={listen.playedAt.toISOString()}
                      className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
                    >
                      {listen.playedAt.toLocaleDateString()}
                    </time>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-editorial overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <h3 className="text-sm font-semibold tracking-tight">Top artists</h3>
                <span className="text-xs text-muted-foreground">by play count</span>
              </div>
              <ul className="divide-y divide-border/60">
                {topArtists.map((artist, i) => (
                  <li
                    key={artist.artistId}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-spotify w-5 shrink-0 text-right tabular-nums">
                        {i + 1}
                      </span>
                      <TrendingUp className="size-4 shrink-0 text-spotify" />
                      <span className="truncate text-sm font-medium">{artist.name}</span>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {Number(artist.count).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

const PageHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: React.ReactNode
}) => (
  <div className="space-y-2">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">
      Overview
    </p>
    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
    <p className="max-w-xl text-muted-foreground">{subtitle}</p>
  </div>
)

const EmptyPanel = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) => (
  <div className="surface-editorial px-8 py-12">
    <div className="mx-auto flex max-w-md flex-col items-start gap-5">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-spotify/10 ring-1 ring-spotify/20">
        {icon}
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  </div>
)

const MetricCard = ({
  icon,
  label,
  value,
  emphasized = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  emphasized?: boolean
}) => (
  <div
    className={`surface-editorial px-6 py-6 ${
      emphasized ? 'ring-1 ring-spotify/25 bg-gradient-to-br from-spotify/5 to-transparent' : ''
    }`}
  >
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
    </div>
    <p
      className={`font-mono font-bold tabular-nums tracking-tight ${
        emphasized ? 'text-5xl' : 'text-3xl'
      }`}
    >
      {value}
    </p>
  </div>
)
