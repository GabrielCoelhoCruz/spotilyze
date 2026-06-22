"use client"

import { memo } from "react"
import { motion } from "framer-motion"

import { fadeUp, MotionItem, MotionStagger } from "@/components/motion/motion-shell"

const PREVIEW_TRACKS = [
  { name: "Midnight City", artist: "M83", ago: "47m ago" },
  { name: "Redbone", artist: "Childish Gambino", ago: "1h ago" },
  { name: "Motion Sickness", artist: "Phoebe Bridgers", ago: "3h ago" },
  { name: "Nightcall", artist: "Kavinsky", ago: "Yesterday" },
]

const PREVIEW_ARTISTS = [
  { name: "M83", plays: 127 },
  { name: "Phoebe Bridgers", plays: 94 },
  { name: "Childish Gambino", plays: 81 },
]

const artistPhoto = (name: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(name)}/72/72`

const PREVIEW_STATS = [
  { label: "Total listens", value: "2,341", sub: "all time" },
  { label: "Unique tracks", value: "847", sub: "distinct" },
  { label: "Hours logged", value: "186", sub: "approx." },
]

export const LandingPreview = memo(function LandingPreview() {
  return (
    <MotionStagger className="relative flex flex-col gap-0">
      <MotionItem>
        <div className="surface-editorial overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <motion.span
                className="size-2 rounded-full bg-spotify"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold tracking-tight">Live dashboard</span>
            </div>
            <span className="rounded-full bg-spotify/10 px-2.5 py-0.5 text-xs font-medium text-spotify">
              Synced
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60">
            {PREVIEW_STATS.map((stat) => (
              <div key={stat.label} className="px-4 py-5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-5">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Recent plays
            </p>
            <ul className="space-y-3">
              {PREVIEW_TRACKS.map((track, index) => (
                <motion.li
                  key={track.name}
                  variants={fadeUp}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground w-4">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="size-9 shrink-0 rounded-lg bg-muted"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/${track.name.replace(/\s/g, "")}/72/72)`,
                        backgroundSize: "cover",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{track.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {track.ago}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border/60 px-6 py-5">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Top artists
            </p>
            <ul className="divide-y divide-border/60">
              {PREVIEW_ARTISTS.map((artist, index) => (
                <li
                  key={artist.name}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-spotify w-4">{index + 1}</span>
                    <div
                      className="size-8 shrink-0 rounded-full bg-muted ring-1 ring-border/60"
                      style={{
                        backgroundImage: `url(${artistPhoto(artist.name)})`,
                        backgroundSize: "cover",
                      }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{artist.name}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {artist.plays} plays
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MotionItem>
    </MotionStagger>
  )
})
