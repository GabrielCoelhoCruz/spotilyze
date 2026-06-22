import { Suspense } from "react"

import { PeriodSelector } from "@/components/period-selector"
import { GenrePie } from "@/components/dashboard/genre-pie"
import { HourlyHeatmap } from "@/components/dashboard/hourly-heatmap"
import { StatCard } from "@/components/dashboard/stat-card"
import { TopArtistsGrid } from "@/components/dashboard/top-artists-grid"
import { TopTracksList } from "@/components/dashboard/top-tracks-list"

export default function DashboardPage() {
  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            A snapshot of your listening habits.
          </p>
        </div>
        <Suspense fallback={null}>
          <PeriodSelector />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Plays" value="12,345" change="+8%" />
        <StatCard title="Unique Tracks" value="1,234" change="+12%" />
        <StatCard title="Listening Time" value="48h 12m" change="+5%" />
        <StatCard title="Top Artist" value="The Weeknd" change="#1" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopTracksList />
        </div>
        <div>
          <TopArtistsGrid />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GenrePie />
        <HourlyHeatmap />
      </div>
    </div>
  )
}
