import Link from 'next/link'
import { Clock, Headphones, Music2, Sparkles, TrendingUp } from 'lucide-react'

import { ArtistAvatar, TrackArtwork } from '@/components/dashboard/artwork'
import { ExportCapture } from '@/components/export/export-capture'
import { getCurrentUser } from '@/lib/auth/session'
import { loadWrappedSnapshot } from '@/lib/wrapped/queries'

export default async function WrappedPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="space-y-10">
        <PageHeader />
        <EmptyPanel
          title="Connect to see your snapshot"
          description="Log in with Spotify to generate your listening snapshot."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/api/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-spotify px-5 text-sm font-semibold text-spotify-foreground transition-all hover:brightness-110"
              >
                Connect Spotify
              </Link>
              <Link
                href="/demo/wrapped"
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

  const snapshot = await loadWrappedSnapshot(user.id)
  const hasData = snapshot.totalListens > 0

  if (!hasData) {
    return (
      <div className="space-y-10">
        <PageHeader />
        <EmptyPanel
          title="No snapshot yet"
          description="Sync your listening history from the dashboard, then come back for your personalized snapshot."
          action={
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-xl bg-spotify px-5 text-sm font-semibold text-spotify-foreground transition-all hover:brightness-110"
            >
              Go to Dashboard
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <PageHeader />

      <ExportCapture id="wrapped-export">
        <div className="space-y-6">
          <HeroCard displayName={user.displayName ?? 'listener'} totalListens={snapshot.totalListens} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={<Headphones className="size-5 text-spotify" />}
              label="Total listens"
              value={snapshot.totalListens.toLocaleString()}
            />
            <StatCard
              icon={<Music2 className="size-5 text-spotify" />}
              label="Unique tracks"
              value={snapshot.uniqueTracks.toLocaleString()}
            />
            <StatCard
              icon={<TrendingUp className="size-5 text-spotify" />}
              label="Unique artists"
              value={snapshot.uniqueArtists.toLocaleString()}
            />
            <StatCard
              icon={<Clock className="size-5 text-spotify" />}
              label="Minutes listened"
              value={snapshot.totalMinutes.toLocaleString()}
            />
            {snapshot.topGenre && (
              <StatCard
                icon={<Sparkles className="size-5 text-spotify" />}
                label="Top genre"
                value={snapshot.topGenre}
                capitalize
              />
            )}
            {snapshot.peakHourLabel && (
              <StatCard
                icon={<Clock className="size-5 text-spotify" />}
                label="Peak hour"
                value={snapshot.peakHourLabel}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {snapshot.topTrack && (
              <HighlightCard
                label="Most played track"
                title={snapshot.topTrack.name}
                subtitle={snapshot.topTrack.artist}
                meta={`${snapshot.topTrack.plays} plays`}
                artwork={
                  <TrackArtwork
                    src={snapshot.topTrack.imageUrl}
                    alt={snapshot.topTrack.name}
                    size={64}
                  />
                }
              />
            )}
            {snapshot.topArtist && (
              <HighlightCard
                label="Most played artist"
                title={snapshot.topArtist.name}
                subtitle="Your #1 artist"
                meta={`${snapshot.topArtist.plays} plays`}
                artwork={
                  <ArtistAvatar
                    src={snapshot.topArtist.imageUrl}
                    alt={snapshot.topArtist.name}
                    fallbackLetter={snapshot.topArtist.name.charAt(0)}
                    size={64}
                  />
                }
              />
            )}
          </div>

          {snapshot.busiestDay && (
            <section className="surface-editorial px-8 py-8 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">
                Busiest day
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {new Date(snapshot.busiestDay.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {snapshot.busiestDay.count} listens in one day
              </p>
            </section>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Based on your current stored listening history (up to Spotify&apos;s recently-played window).
          </p>
        </div>
      </ExportCapture>
    </div>
  )
}

const PageHeader = () => (
  <div className="space-y-2 text-center">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">
      Your snapshot
    </p>
    <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Wrapped</h2>
    <p className="mx-auto max-w-lg text-muted-foreground">
      A shareable snapshot of your listening habits — built from your synced history.
    </p>
  </div>
)

const HeroCard = ({
  displayName,
  totalListens,
}: {
  displayName: string
  totalListens: number
}) => (
  <section className="surface-editorial overflow-hidden bg-gradient-to-br from-spotify/15 via-transparent to-transparent px-8 py-12 text-center ring-1 ring-spotify/20">
    <Sparkles className="mx-auto size-8 text-spotify" aria-hidden />
    <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
      {displayName}&apos;s listening snapshot
    </h3>
    <p className="mt-2 font-mono text-5xl font-bold tabular-nums text-spotify md:text-6xl">
      {totalListens}
    </p>
    <p className="mt-1 text-sm text-muted-foreground">total plays in your library</p>
  </section>
)

const StatCard = ({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  capitalize?: boolean
}) => (
  <div className="surface-editorial px-6 py-6">
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
    </div>
    <p className={`text-2xl font-bold tracking-tight ${capitalize ? 'capitalize' : ''}`}>
      {value}
    </p>
  </div>
)

const HighlightCard = ({
  label,
  title,
  subtitle,
  meta,
  artwork,
}: {
  label: string
  title: string
  subtitle: string
  meta: string
  artwork?: React.ReactNode
}) => (
  <section className="surface-editorial px-8 py-8">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">{label}</p>
    {artwork && <div className="mt-4">{artwork}</div>}
    <h4 className="mt-3 text-2xl font-bold tracking-tight">{title}</h4>
    <p className="mt-1 text-muted-foreground">{subtitle}</p>
    <p className="mt-4 font-mono text-sm text-spotify tabular-nums">{meta}</p>
  </section>
)

const EmptyPanel = ({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) => (
  <div className="surface-editorial px-8 py-12">
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-spotify/10 ring-1 ring-spotify/20">
        <Sparkles className="size-6 text-spotify" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  </div>
)
