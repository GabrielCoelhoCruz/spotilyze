'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SyncButtonProps {
  label?: string
}

export const SyncButton = ({ label = 'Sync from Spotify' }: SyncButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSync = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/sync', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Sync failed')
        return
      }

      setStatus('success')
      setMessage(`Imported ${data.imported} new listens (${data.total} fetched).`)
      window.location.reload()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Button
        type="button"
        variant="spotify"
        onClick={handleSync}
        disabled={status === 'loading'}
        aria-label="Sync listening history from Spotify"
        className="gap-2"
      >
        {status === 'loading' && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {status === 'loading' ? 'Syncing…' : label}
      </Button>
      {status === 'success' && (
        <span className="text-sm text-spotify" role="status">{message}</span>
      )}
      {status === 'error' && (
        <span className="text-sm text-destructive" role="alert">{message}</span>
      )}
    </div>
  )
}
