import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArtistAvatar } from '@/components/dashboard/artwork'

interface Artist {
  id: string
  name: string
  plays: number
  imageUrl?: string | null
}

interface TopArtistsGridProps {
  artists: Artist[]
  isLoading?: boolean
}

export const TopArtistsGrid = ({ artists, isLoading = false }: TopArtistsGridProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Artists</CardTitle>
        <CardDescription>Artists you listened to the most.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))
            : artists.length === 0 ? (
                <p className="col-span-full text-sm text-muted-foreground">
                  No artists yet — sync to pull your history.
                </p>
              ) : (
                artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="rounded-xl bg-muted p-3 text-center transition-colors hover:bg-muted/80"
                  >
                    <ArtistAvatar
                      src={artist.imageUrl}
                      alt={artist.name}
                      fallbackLetter={artist.name.charAt(0)}
                      size={80}
                      className="mx-auto mb-2 aspect-square"
                    />
                    <p className="truncate text-sm font-medium">{artist.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {artist.plays} plays
                    </p>
                  </div>
                ))
              )}
        </div>
      </CardContent>
    </Card>
  )
}
