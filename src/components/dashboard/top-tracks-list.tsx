import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Track {
  id: string
  rank: number
  name: string
  artist: string
  plays: number
}

const PLACEHOLDER_TRACKS: Track[] = [
  { id: "1", rank: 1, name: "Blinding Lights", artist: "The Weeknd", plays: 42 },
  { id: "2", rank: 2, name: "Save Your Tears", artist: "The Weeknd", plays: 38 },
  { id: "3", rank: 3, name: "Levitating", artist: "Dua Lipa", plays: 35 },
  { id: "4", rank: 4, name: "Stay", artist: "The Kid LAROI & Justin Bieber", plays: 31 },
  { id: "5", rank: 5, name: "Good 4 U", artist: "Olivia Rodrigo", plays: 28 },
]

export function TopTracksList({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Tracks</CardTitle>
        <CardDescription>Your most played songs this period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </li>
              ))
            : PLACEHOLDER_TRACKS.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                    {track.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{track.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {track.artist}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {track.plays} plays
                  </span>
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  )
}
