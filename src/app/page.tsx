import { LandingHero } from "@/components/motion/landing-hero"
import { LandingPreview } from "@/components/motion/landing-preview"
import { SpotifyOrb } from "@/components/motion/spotify-orb"

interface HomePageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { error } = await searchParams

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background">
      <SpotifyOrb />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 noise-overlay"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[100dvh] grid-cols-1 items-center gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-0">
          <LandingHero error={error} />

          <div className="hidden lg:block lg:pr-4">
            <LandingPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
