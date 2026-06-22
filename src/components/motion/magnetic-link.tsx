"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import type { ReactNode, MouseEvent } from "react"

import { cn } from "@/lib/utils"

interface MagneticLinkProps {
  href: string
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export const MagneticLink = ({
  href,
  children,
  className,
  ariaLabel,
}: MagneticLinkProps) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })
  const rotateX = useTransform(springY, [-8, 8], [2, -2])
  const rotateY = useTransform(springX, [-8, 8], [-2, 2])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((event.clientX - centerX) * 0.15)
    y.set((event.clientY - centerY) * 0.15)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ x: springX, y: springY, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Link href={href} aria-label={ariaLabel} className={cn(className)}>
        {children}
      </Link>
    </motion.div>
  )
}
