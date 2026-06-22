import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TrackArtwork } from '@/components/dashboard/artwork'

interface Track {
  id: string
  rank: number
  name: string
  artist: string
  plays: number
  imageUrl?: string | null
}

interface TopTracksListProps {
  tracks: Track[]
  isLoading?: boolean
}

export const TopTracksList = ({ tracks, isLoading = false }: TopTracksListProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Tracks</CardTitle>
        <CardDescription>Your most played songs.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-8" />
              </li>
            ))}
          </ul>
        ) : tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tracks yet — sync to pull your history.</p>
        ) : (
          <ul className="space-y-3">
            {tracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
              >
                <TrackArtwork src={track.imageUrl} alt={track.name} size={40} />
                <span className="flex size-6 shrink-0 items-center justify-center text-sm font-medium tabular-nums text-muted-foreground">
                  {track.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {track.plays} plays
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
