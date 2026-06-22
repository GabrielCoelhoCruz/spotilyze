"use client"

import { memo } from "react"
import { motion } from "framer-motion"

export const SpotifyOrb = memo(function SpotifyOrb() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-spotify/12 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl dark:bg-white/3"
        animate={{
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 h-56 w-56 rounded-full bg-spotify/8 blur-2xl"
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  )
})
