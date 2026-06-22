import { syncAllConnectedUsers, syncUserListeningData } from '@/lib/spotify/sync'

declare global {
  var __spotilyzeAutoSyncStarted: boolean | undefined
}

const BOOT_DELAY_MS = 30_000

export const getAutoSyncIntervalMs = (): number => {
  const minutes = Number(process.env.AUTO_SYNC_INTERVAL_MINUTES ?? 360)
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60_000 : 360 * 60_000
}

export const getStaleSyncThresholdMs = (): number => {
  const minutes = Number(process.env.AUTO_SYNC_STALE_MINUTES ?? 30)
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60_000 : 30 * 60_000
}

export const isAutoSyncEnabled = (): boolean => {
  if (process.env.AUTO_SYNC_ENABLED === 'false') return false
  if (process.env.AUTO_SYNC_ENABLED === 'true') return true
  return process.env.NODE_ENV === 'production'
}

export const isUserSyncStale = (lastSyncedAt: Date | null | undefined): boolean => {
  if (!lastSyncedAt) return true
  return Date.now() - lastSyncedAt.getTime() > getStaleSyncThresholdMs()
}

let isRunning = false

export const runAutoSync = async (): Promise<{
  synced: number
  failed: number
} | null> => {
  if (isRunning) return null
  isRunning = true

  try {
    const result = await syncAllConnectedUsers()
    console.info(`[auto-sync] completed synced=${result.synced} failed=${result.failed}`)
    return { synced: result.synced, failed: result.failed }
  } catch (error) {
    console.error('[auto-sync] failed:', error)
    return null
  } finally {
    isRunning = false
  }
}

export const startAutoSyncScheduler = (): void => {
  if (!isAutoSyncEnabled()) {
    console.info('[auto-sync] scheduler disabled')
    return
  }

  if (globalThis.__spotilyzeAutoSyncStarted) return
  globalThis.__spotilyzeAutoSyncStarted = true

  const intervalMs = getAutoSyncIntervalMs()
  const intervalMinutes = Math.round(intervalMs / 60_000)

  setTimeout(() => {
    void runAutoSync()
  }, BOOT_DELAY_MS)

  setInterval(() => {
    void runAutoSync()
  }, intervalMs)

  console.info(`[auto-sync] scheduler started (every ${intervalMinutes} min, first run in 30s)`)
}

export const triggerStaleUserSync = (
  userId: string,
  lastSyncedAt: Date | null | undefined,
): void => {
  if (!isUserSyncStale(lastSyncedAt)) return

  void syncUserListeningData(userId).catch((error) => {
    console.error(`[auto-sync] stale user sync failed for ${userId}:`, error)
  })
}

export const verifyCronAuth = (request: Request): boolean => {
  const secret = process.env.CRON_SECRET

  if (secret) {
    const authHeader = request.headers.get('authorization')
    const provided = authHeader?.replace(/^Bearer\s+/i, '')
    if (provided === secret) return true
  }

  // Vercel Cron sends this header; only trust it when no secret is configured
  // or when Vercel also sends Authorization: Bearer CRON_SECRET (recommended).
  if (!secret && request.headers.get('x-vercel-cron') === '1') {
    return true
  }

  return false
}
