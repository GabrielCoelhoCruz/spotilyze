"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

const spring = { type: "spring" as const, stiffness: 100, damping: 20 }

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
}

interface MotionShellProps {
  children: ReactNode
  className?: string
  delay?: number
}

export const MotionShell = ({ children, className, delay = 0 }: MotionShellProps) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: { ...spring, delay },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
)

interface MotionStaggerProps {
  children: ReactNode
  className?: string
}

export const MotionStagger = ({ children, className }: MotionStaggerProps) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={staggerContainer}
    className={className}
  >
    {children}
  </motion.div>
)

interface MotionItemProps {
  children: ReactNode
  className?: string
}

export const MotionItem = ({ children, className }: MotionItemProps) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
)
