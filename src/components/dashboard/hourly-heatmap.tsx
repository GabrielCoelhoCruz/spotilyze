import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatHourLabel } from '@/lib/dashboard/aggregations'

interface HourlyCount {
  hour: number
  count: number
}

interface HourlyHeatmapProps {
  hourlyCounts: HourlyCount[]
  peakHour: number | null
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const HourlyHeatmap = ({ hourlyCounts, peakHour }: HourlyHeatmapProps) => {
  const maxCount = Math.max(...hourlyCounts.map((h) => h.count), 1)
  const hasData = hourlyCounts.some((h) => h.count > 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Listening Heatmap</CardTitle>
        <CardDescription>
          {peakHour !== null
            ? `Peak hour: ${formatHourLabel(peakHour)}`
            : 'Hourly activity across your plays.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground">No listening data to chart yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[18rem] space-y-3">
              <div
                className="grid grid-cols-24 gap-0.5"
                role="img"
                aria-label="Hourly listening heatmap"
              >
                {hourlyCounts.map((cell) => {
                  const intensity = cell.count / maxCount
                  return (
                    <div
                      key={cell.hour}
                      title={`${formatHourLabel(cell.hour)}: ${cell.count} plays`}
                      className="aspect-square min-w-0 rounded-sm transition-colors"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--spotify, #1DB954) ${Math.round(intensity * 100)}%, transparent)`,
                      }}
                      aria-label={`${formatHourLabel(cell.hour)}: ${cell.count} plays`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const DayHourHeatmap = ({
  matrix,
}: {
  matrix: { day: number; hour: number; count: number }[]
}) => {
  const maxCount = Math.max(...matrix.map((c) => c.count), 1)
  const getCount = (day: number, hour: number) =>
    matrix.find((c) => c.day === day && c.hour === hour)?.count ?? 0

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[36rem] space-y-2">
        <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="flex flex-col justify-around text-[10px] text-muted-foreground">
          {DAY_LABELS.map((label) => (
            <span key={label} className="h-3 leading-3">
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-0.5">
          {DAY_LABELS.map((_, day) => (
            <div key={day} className="grid grid-cols-24 gap-px">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = getCount(day, hour)
                const intensity = count / maxCount
                return (
                  <div
                    key={hour}
                    title={`${DAY_LABELS[day]} ${formatHourLabel(hour)}: ${count}`}
                    className="h-3 rounded-[2px]"
                    style={{
                      backgroundColor:
                        count === 0
                          ? 'var(--muted)'
                          : `color-mix(in srgb, var(--spotify, #1DB954) ${Math.round(intensity * 100)}%, transparent)`,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
