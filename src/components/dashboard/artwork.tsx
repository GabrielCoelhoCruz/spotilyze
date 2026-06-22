import Image from 'next/image'
import { Music2, User } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ArtworkProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
  variant?: 'square' | 'circle'
}

export const TrackArtwork = ({
  src,
  alt,
  size = 36,
  className,
  variant = 'square',
}: ArtworkProps) => {
  const rounded = variant === 'circle' ? 'rounded-full' : 'rounded-xl'

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 object-cover ring-1 ring-border/60', rounded, className)}
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-muted ring-1 ring-border/60',
        rounded,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Music2 className="size-4 text-muted-foreground" />
    </div>
  )
}

export const ArtistAvatar = ({
  src,
  alt,
  size = 36,
  className,
  fallbackLetter,
}: ArtworkProps & { fallbackLetter?: string }) => {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover ring-1 ring-border/60', className)}
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }

  const letter = fallbackLetter ?? alt.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold ring-1 ring-border/60',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {letter || <User className="size-4 text-muted-foreground" />}
    </div>
  )
}
