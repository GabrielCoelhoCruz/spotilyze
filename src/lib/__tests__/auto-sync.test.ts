import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAutoSyncIntervalMs,
  getStaleSyncThresholdMs,
  isAutoSyncEnabled,
  isUserSyncStale,
  verifyCronAuth,
} from '@/lib/spotify/auto-sync'

describe('auto-sync config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('enables auto sync in production by default', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('AUTO_SYNC_ENABLED', '')
    expect(isAutoSyncEnabled()).toBe(true)
  })

  it('disables auto sync in development unless forced', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('AUTO_SYNC_ENABLED', '')
    expect(isAutoSyncEnabled()).toBe(false)

    vi.stubEnv('AUTO_SYNC_ENABLED', 'true')
    expect(isAutoSyncEnabled()).toBe(true)
  })

  it('parses interval and stale thresholds', () => {
    vi.stubEnv('AUTO_SYNC_INTERVAL_MINUTES', '120')
    vi.stubEnv('AUTO_SYNC_STALE_MINUTES', '15')
    expect(getAutoSyncIntervalMs()).toBe(120 * 60_000)
    expect(getStaleSyncThresholdMs()).toBe(15 * 60_000)
  })
})

describe('isUserSyncStale', () => {
  it('returns true when never synced', () => {
    expect(isUserSyncStale(null)).toBe(true)
    expect(isUserSyncStale(undefined)).toBe(true)
  })

  it('returns false for recent sync', () => {
    const recent = new Date(Date.now() - 5 * 60_000)
    expect(isUserSyncStale(recent)).toBe(false)
  })
})

describe('verifyCronAuth', () => {
  const originalSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret
  })

  it('accepts bearer token when CRON_SECRET is set', () => {
    process.env.CRON_SECRET = 'test-secret'
    const request = new Request('http://localhost/api/cron/sync', {
      headers: { authorization: 'Bearer test-secret' },
    })
    expect(verifyCronAuth(request)).toBe(true)
  })

  it('accepts Vercel cron header when no secret configured', () => {
    delete process.env.CRON_SECRET
    const request = new Request('http://localhost/api/cron/sync', {
      headers: { 'x-vercel-cron': '1' },
    })
    expect(verifyCronAuth(request)).toBe(true)
  })

  it('rejects missing auth', () => {
    process.env.CRON_SECRET = 'test-secret'
    const request = new Request('http://localhost/api/cron/sync')
    expect(verifyCronAuth(request)).toBe(false)
  })
})
