import Link from 'next/link'
import { Globe, LogOut, Music2, RefreshCw, Star, User } from 'lucide-react'

import { ExportButtons } from '@/components/export/export-buttons'
import { ExtendedHistoryImport } from '@/components/extended-history-import'
import { getCurrentUser } from '@/lib/auth/session'
import { SyncButton } from '../dashboard/sync-button'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="space-y-10">
        <PageHeader
          title="Settings"
          subtitle="Manage your Spotify connection and sync preferences."
        />
        <EmptyPanel
          icon={<Music2 className="size-6 text-spotify" />}
          title="Not connected"
          description="Log in with your Spotify account to manage your connection and sync settings."
          action={
            <Link
              href="/api/auth/login"
              className="inline-flex h-11 items-center rounded-xl bg-spotify px-5 text-sm font-semibold text-spotify-foreground transition-all hover:brightness-110"
            >
              Connect Spotify
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Settings"
        subtitle="Manage your Spotify connection and sync preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        <div className="space-y-6">
          <section className="surface-editorial overflow-hidden">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-spotify/10 ring-1 ring-spotify/20">
                  <User className="size-6 text-spotify" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {user.displayName ?? 'Spotify user'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Connected account</p>
                </div>
              </div>
            </div>
            <dl className="divide-y divide-border/60">
              <AccountRow
                icon={<User className="size-4 text-muted-foreground" />}
                label="Display name"
                value={user.displayName ?? 'Spotify user'}
              />
              {user.country && (
                <AccountRow
                  icon={<Globe className="size-4 text-muted-foreground" />}
                  label="Country"
                  value={user.country}
                />
              )}
              {user.product && (
                <AccountRow
                  icon={<Star className="size-4 text-muted-foreground" />}
                  label="Plan"
                  value={
                    <span className="rounded-full bg-spotify/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-spotify">
                      {user.product}
                    </span>
                  }
                />
              )}
            </dl>
          </section>

          <section className="surface-editorial overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <RefreshCw className="size-4 text-spotify" />
              <h3 className="text-sm font-semibold tracking-tight">Data sync</h3>
            </div>
            <div className="space-y-4 px-6 py-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pull your latest plays from Spotify. The API exposes up to 50 recent tracks at a time.
              </p>
              {user.lastSyncedAt && (
                <p className="text-xs text-muted-foreground">
                  Last synced {user.lastSyncedAt.toLocaleString()}
                  {user.lastImported != null && ` · ${user.lastImported} imported`}
                </p>
              )}
              {user.lastSyncError && (
                <p className="text-xs text-destructive" role="alert">
                  Last sync error: {user.lastSyncError}
                </p>
              )}
              <SyncButton />
            </div>
          </section>

          <ExtendedHistoryImport />

          <section className="surface-editorial overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <Music2 className="size-4 text-spotify" />
              <h3 className="text-sm font-semibold tracking-tight">Export data</h3>
            </div>
            <div className="space-y-4 px-6 py-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Download your stored listening history as CSV or capture the dashboard as a PNG image.
              </p>
              <ExportButtons />
            </div>
          </section>
        </div>

        <section className="surface-editorial overflow-hidden border-destructive/20 lg:self-start">
          <div className="flex items-center gap-3 border-b border-destructive/20 px-6 py-4">
            <LogOut className="size-4 text-destructive" />
            <h3 className="text-sm font-semibold tracking-tight text-destructive">Session</h3>
          </div>
          <div className="space-y-4 px-6 py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Log out to disconnect this browser session. Your stored listening data will remain on this device.
            </p>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-xl border border-destructive/40 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 active:scale-[0.98]"
              >
                Log out
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

const PageHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <div className="space-y-2">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-spotify">
      Account
    </p>
    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
    <p className="max-w-xl text-muted-foreground">{subtitle}</p>
  </div>
)

const EmptyPanel = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) => (
  <div className="surface-editorial px-8 py-12">
    <div className="mx-auto flex max-w-md flex-col items-start gap-5">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-spotify/10 ring-1 ring-spotify/20">
        {icon}
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  </div>
)

const AccountRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-center justify-between gap-4 px-6 py-4">
    <dt className="flex items-center gap-2.5 text-sm text-muted-foreground">
      {icon}
      {label}
    </dt>
    <dd className="text-sm font-medium">{value}</dd>
  </div>
)
