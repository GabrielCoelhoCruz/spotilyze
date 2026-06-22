import Link from 'next/link'
import { BarChart3, Clock, Headphones } from 'lucide-react'

import { ArtistAvatar, TrackArtwork } from '@/components/dashboard/artwork'

import { GenrePie } from '@/components/dashboard/genre-pie'
import { DayHourHeatmap, HourlyHeatmap } from '@/components/dashboard/hourly-heatmap'
import { TopArtistsGrid } from '@/components/dashboard/top-artists-grid'
import { TopTracksList } from '@/components/dashboard/top-tracks-list'
import { ExportCapture } from '@/components/export/export-capture'
import type { DashboardData } from '@/lib/dashboard/queries'
import { SyncButton } from '@/app/(app)/dashboard/sync-button'

interface DashboardContentProps {
  data: DashboardData
  displayName: string
  isDemo?: boolean
  devActions?: React.ReactNode
}

const PageHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: React.ReactNode
}) => (
  <div className="space-y-2">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">Overview</p>
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
  action?: React.ReactNode
}) => (
  <div className="surface-editorial px-6 py-12 sm:px-8">
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
      emphasized ? 'bg-gradient-to-br from-spotify/5 to-transparent ring-1 ring-spotify/25' : ''
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
        emphasized ? 'text-4xl sm:text-5xl' : 'text-3xl'
      }`}
    >
      {value}
    </p>
  </div>
)

export const DashboardPageHeader = PageHeader
export const DashboardEmptyPanel = EmptyPanel

export const DashboardContent = ({
  data,
  displayName,
  isDemo = false,
  devActions,
}: DashboardContentProps) => {
  const hasData = data.totalListens > 0

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Dashboard"
          subtitle={
            <>
              {isDemo ? (
                <>
                  Exploring sample data as{' '}
                  <span className="font-medium text-foreground">{displayName}</span>.
                </>
              ) : (
                <>
                  Welcome back,{' '}
                  <span className="font-medium text-foreground">{displayName}</span>. Your listening
                  activity at a glance.
                </>
              )}
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          {data.lastSyncedAt && !isDemo && (
            <span className="text-xs text-muted-foreground">
              Last synced {data.lastSyncedAt.toLocaleString()}
            </span>
          )}
          {!isDemo && <SyncButton />}
          {devActions}
        </div>
      </div>

      {!hasData && (
        <EmptyPanel
          icon={<Headphones className="size-6 text-spotify" />}
          title="No listening data yet"
          description={
            isDemo
              ? 'Demo data is being prepared. Refresh in a moment.'
              : 'Spotify exposes your last ~50 plays. Hit sync to pull them now — it only takes a moment.'
          }
          action={!isDemo ? <SyncButton /> : undefined}
        />
      )}

      {hasData && (
        <ExportCapture id="dashboard-export">
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
              <MetricCard
                icon={<Headphones className="size-4 text-spotify" />}
                label="Total listens"
                value={data.totalListens.toLocaleString()}
                emphasized
              />
              <MetricCard
                icon={<BarChart3 className="size-4 text-muted-foreground" />}
                label="Unique tracks"
                value={data.uniqueTracks.toLocaleString()}
              />
              <MetricCard
                icon={<Clock className="size-4 text-muted-foreground" />}
                label="Minutes listened"
                value={Math.round(data.totalMinutes).toLocaleString()}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <HourlyHeatmap hourlyCounts={data.hourlyCounts} peakHour={data.peakHour} />
              <GenrePie genres={data.genres} />
            </div>

            {data.dayHourMatrix.length > 0 && (
              <section className="surface-editorial overflow-hidden p-4 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold tracking-tight">Weekly pattern</h3>
                <DayHourHeatmap matrix={data.dayHourMatrix} />
              </section>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <TopTracksList tracks={data.topTracks} />
              <TopArtistsGrid artists={data.topArtists} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="surface-editorial overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-6">
                  <h3 className="text-sm font-semibold tracking-tight">Recent listens</h3>
                  <span className="text-xs text-muted-foreground">{data.recentListens.length} tracks</span>
                </div>
                <ul className="divide-y divide-border/60">
                  {data.recentListens.map((listen, index) => (
                    <li
                      key={`${listen.trackId}-${index}`}
                      className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <TrackArtwork
                          src={listen.imageUrl}
                          alt={listen.trackName}
                          size={36}
                        />
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium">{listen.trackName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {listen.artistName}
                          </span>
                        </div>
                      </div>
                      <time
                        dateTime={listen.playedAt.toISOString()}
                        className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
                      >
                        {listen.playedAt.toLocaleDateString()}
                      </time>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="surface-editorial overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-6">
                  <h3 className="text-sm font-semibold tracking-tight">Top artists</h3>
                  <span className="text-xs text-muted-foreground">by play count</span>
                </div>
                <ul className="divide-y divide-border/60">
                  {data.topArtists.map((artist, i) => (
                    <li
                      key={artist.id}
                      className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-spotify">
                          {i + 1}
                        </span>
                        <ArtistAvatar
                          src={artist.imageUrl}
                          alt={artist.name}
                          fallbackLetter={artist.name.charAt(0)}
                          size={32}
                        />
                        <span className="truncate text-sm font-medium">{artist.name}</span>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {artist.plays.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {isDemo && (
              <div className="rounded-2xl border border-spotify/25 bg-spotify/5 px-6 py-5 text-center">
                <p className="text-sm text-muted-foreground">
                  This is sample data.{' '}
                  <Link href="/api/auth/login" className="font-medium text-spotify hover:underline">
                    Connect your Spotify
                  </Link>{' '}
                  to see your real stats.
                </p>
              </div>
            )}
          </div>
        </ExportCapture>
      )}
    </div>
  )
}
