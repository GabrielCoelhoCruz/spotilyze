"use client"

import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"

import { MagneticLink } from "@/components/motion/magnetic-link"
import { MotionItem, MotionStagger } from "@/components/motion/motion-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LandingHeroProps {
  error?: string
}

export const LandingHero = ({ error }: LandingHeroProps) => (
  <MotionStagger className="flex flex-col gap-10 lg:pl-4">
    <MotionItem>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-spotify/25 bg-spotify/8 px-4 py-1.5 text-xs font-semibold tracking-widest text-spotify uppercase">
        Listening analytics
      </span>
    </MotionItem>

    <MotionItem>
      <h1 className="text-balance text-4xl font-bold tracking-tighter leading-[0.95] text-foreground md:text-6xl lg:text-7xl">
        Every play,
        <br />
        <span className="text-spotify">mapped.</span>
      </h1>
    </MotionItem>

    <MotionItem>
      <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
        Spotilyze turns your Spotify history into a clear picture of what you actually listen to — artists, tracks, and time spent, without the noise.
      </p>
    </MotionItem>

    {error && (
      <MotionItem>
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/8 px-5 py-4 text-sm text-destructive"
        >
          Login failed: {decodeURIComponent(error)}
        </div>
      </MotionItem>
    )}

    <MotionItem>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <MagneticLink
          href="/api/auth/login"
          ariaLabel="Connect your Spotify account"
          className={cn(buttonVariants({ variant: "spotify", size: "lg" }), "gap-2")}
        >
          Connect Spotify
          <ArrowRight className="size-4" aria-hidden />
        </MagneticLink>
        <Link
          href="/dashboard"
          aria-label="View dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          View dashboard
        </Link>
      </div>
    </MotionItem>

    <MotionItem>
      <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/50 px-4 py-3">
        <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Read-only Spotify access. Your data stays on your device until you sync.
        </p>
      </div>
    </MotionItem>
  </MotionStagger>
)
