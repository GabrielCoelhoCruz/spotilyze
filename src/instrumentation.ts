export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAutoSyncScheduler } = await import('@/lib/spotify/auto-sync')
    startAutoSyncScheduler()
  }
}
