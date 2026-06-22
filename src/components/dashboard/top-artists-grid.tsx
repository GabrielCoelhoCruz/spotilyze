import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Artist {
  id: string
  name: string
  plays: number
}

const PLACEHOLDER_ARTISTS: Artist[] = [
  { id: "1", name: "The Weeknd", plays: 156 },
  { id: "2", name: "Dua Lipa", plays: 98 },
  { id: "3", name: "Olivia Rodrigo", plays: 87 },
  { id: "4", name: "Taylor Swift", plays: 76 },
  { id: "5", name: "Bad Bunny", plays: 65 },
  { id: "6", name: "Drake", plays: 54 },
]

export function TopArtistsGrid({ isLoading = false }: { isLoading?: boolean }) {
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
            : PLACEHOLDER_ARTISTS.map((artist) => (
                <div
                  key={artist.id}
                  className="rounded-xl bg-muted p-3 text-center transition-colors hover:bg-muted/80"
                >
                  <div className="bg-primary/10 mx-auto mb-2 flex aspect-square items-center justify-center rounded-full text-lg font-bold">
                    {artist.name.charAt(0)}
                  </div>
                  <p className="truncate text-sm font-medium">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {artist.plays} plays
                  </p>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
