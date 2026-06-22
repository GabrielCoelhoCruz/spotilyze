import { Music2 } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUser } from "@/lib/auth/session"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-40 w-full px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-border/60 bg-background/75 px-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label="Go to dashboard"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-spotify/10 ring-1 ring-spotify/20">
              <Music2 className="size-4 text-spotify" aria-hidden />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">Spotilyze</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Analytics
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Dashboard
                </Link>
                <Link
                  href="/wrapped"
                  className="inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Wrapped
                </Link>
                <span className="mr-1 hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
                  {user.displayName ?? "Logged in"}
                </span>
              </>
            ) : (
              <Link
                href="/demo/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Demo
              </Link>
            )}
            <Link
              href="/settings"
              className="inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Settings
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  )
}
