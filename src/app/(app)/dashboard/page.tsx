import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { artists, listens, tracks } from '@/db/schema'
import { DemoButton } from './demo-button'

const loadDashboardData = async () => {
  const totalListens = await db.$count(listens)

  const uniqueTracks = await db
    .select({ count: sql<number>`count(distinct ${listens.trackId})` })
    .from(listens)
    .then((rows) => rows[0]?.count ?? 0)

  const totalMinutes = await db
    .select({ total: sql<number>`sum(${tracks.durationMs}) / 60000` })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
    .then((rows) => rows[0]?.total ?? 0)

  const recentListens = await db
    .select({
      playedAt: listens.playedAt,
      trackName: tracks.name,
      trackId: tracks.id,
    })
    .from(listens)
    .innerJoin(tracks, eq(listens.trackId, tracks.id))
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
    .groupBy(artists.id, artists.name)
    .orderBy(desc(sql<number>`count(${listens.id})`))
    .limit(5)

  return { totalListens, uniqueTracks, totalMinutes, recentListens, topArtists }
}

export default async function DashboardPage() {
  const { totalListens, uniqueTracks, totalMinutes, recentListens, topArtists } = await loadDashboardData()
  const hasData = totalListens > 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Your listening activity at a glance.</p>
        </div>
        <DemoButton />
      </div>

      {!hasData && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-600">No listening data yet.</p>
          <p className="text-sm text-gray-500">Click &quot;Use demo data&quot; to populate your dashboard.</p>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total listens" value={totalListens.toLocaleString()} />
            <StatCard label="Unique tracks" value={uniqueTracks.toLocaleString()} />
            <StatCard label="Minutes listened" value={Math.round(totalMinutes).toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Recent listens</h3>
              <ul className="space-y-3">
                {recentListens.map((listen, index) => (
                  <li key={`${listen.trackId}-${index}`} className="flex justify-between text-sm">
                    <span className="text-gray-900">{listen.trackName}</span>
                    <span className="text-gray-500">{listen.playedAt.toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Top artists</h3>
              <ul className="space-y-3">
                {topArtists.map((artist) => (
                  <li key={artist.artistId} className="flex justify-between text-sm">
                    <span className="text-gray-900">{artist.name}</span>
                    <span className="text-gray-500">{artist.count} plays</span>
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

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
  </div>
)
