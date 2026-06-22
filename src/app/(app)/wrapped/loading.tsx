import { Skeleton } from '@/components/ui/skeleton'

export default function WrappedLoading() {
  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-lg space-y-2 text-center">
        <Skeleton className="mx-auto h-3 w-24" />
        <Skeleton className="mx-auto h-12 w-40" />
        <Skeleton className="mx-auto h-5 w-full" />
      </div>

      <Skeleton className="h-48 rounded-2xl" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  )
}
