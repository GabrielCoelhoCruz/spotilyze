import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function HourlyHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listening Heatmap</CardTitle>
        <CardDescription>Hourly activity coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground">Hourly heatmap placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}
