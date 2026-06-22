import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-spotify/25 bg-spotify/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 shrink-0 text-spotify" aria-hidden />
          <span>
            <span className="font-medium text-foreground">Demo mode</span>
            <span className="text-muted-foreground"> — sample listening data, no Spotify account needed.</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/demo/dashboard"
            className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/demo/wrapped"
            className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Wrapped
          </Link>
          <Link
            href="/api/auth/login"
            className="inline-flex h-8 items-center rounded-lg bg-spotify px-3 text-xs font-semibold text-spotify-foreground hover:brightness-110"
          >
            Connect Spotify
          </Link>
        </div>
      </div>
      {children}
    </>
  )
}
