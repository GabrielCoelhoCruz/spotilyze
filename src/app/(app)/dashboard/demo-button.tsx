'use client'

import { useState } from 'react'

export const DemoButton = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSeedDemoData = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/demo-data', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to seed demo data')
        return
      }

      setStatus('success')
      setMessage(`Seeded ${data.seeded.listens} listens across ${data.seeded.days} days.`)
      window.location.reload()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleSeedDemoData}
        disabled={status === 'loading'}
        aria-label="Seed demo listening data"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Seeding…' : 'Use demo data'}
      </button>
      {status === 'success' && <span className="text-sm text-emerald-700">{message}</span>}
      {status === 'error' && <span className="text-sm text-red-600">{message}</span>}
    </div>
  )
}
