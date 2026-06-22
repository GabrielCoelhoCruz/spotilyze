import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GENRE_COLORS } from '@/lib/dashboard/aggregations'

interface GenreSlice {
  genre: string
  count: number
}

interface GenrePieProps {
  genres: GenreSlice[]
}

const buildPieSlices = (genres: GenreSlice[]) => {
  const top = genres.slice(0, 8)
  const total = top.reduce((sum, g) => sum + g.count, 0)
  if (total === 0) return []

  let cumulative = 0
  return top.map((genre, index) => {
    const fraction = genre.count / total
    const startAngle = cumulative * 360
    cumulative += fraction
    const endAngle = cumulative * 360
    return {
      ...genre,
      fraction,
      startAngle,
      endAngle,
      color: GENRE_COLORS[index % GENRE_COLORS.length],
    }
  })
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export const GenrePie = ({ genres }: GenrePieProps) => {
  const slices = buildPieSlices(genres)
  const hasData = slices.length > 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Genres</CardTitle>
        <CardDescription>Genre breakdown from your listening history.</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              No genre tags yet. Spotify Dev Mode hides genres — sync pulls them from MusicBrainz
              when available.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <svg
              viewBox="0 0 200 200"
              className="mx-auto size-44 shrink-0"
              role="img"
              aria-label="Genre distribution pie chart"
            >
              {slices.map((slice) => (
                <path
                  key={slice.genre}
                  d={describeArc(100, 100, 90, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </svg>
            <ul className="flex-1 space-y-2">
              {slices.map((slice) => (
                <li key={slice.genre} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden
                    />
                    <span className="truncate capitalize">{slice.genre}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {Math.round(slice.fraction * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
