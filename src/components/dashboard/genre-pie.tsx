import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function GenrePie() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Genres</CardTitle>
        <CardDescription>Genre breakdown coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground">Genre pie chart placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}
