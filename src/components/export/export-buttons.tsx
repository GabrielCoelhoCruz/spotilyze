'use client'

import { useState } from 'react'
import { Download, ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  captureTargetId?: string
}

export const ExportButtons = ({ captureTargetId = 'dashboard-export' }: ExportButtonsProps) => {
  const [csvStatus, setCsvStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [pngStatus, setPngStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleCsvExport = async () => {
    setCsvStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/export/csv')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'CSV export failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `spotilyze-listens-${new Date().toISOString().slice(0, 10)}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
      setCsvStatus('idle')
    } catch (error) {
      setCsvStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'CSV export failed')
    }
  }

  const handlePngExport = async () => {
    setPngStatus('loading')
    setErrorMessage('')

    try {
      const target = document.getElementById(captureTargetId)
      if (!target) {
        throw new Error('Nothing to capture — visit the dashboard first.')
      }

      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background') || '#0a0a0a',
      })

      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = `spotilyze-dashboard-${new Date().toISOString().slice(0, 10)}.png`
      anchor.click()
      setPngStatus('idle')
    } catch (error) {
      setPngStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'PNG export failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCsvExport}
          disabled={csvStatus === 'loading'}
          className="gap-2"
          aria-label="Export listening history as CSV"
        >
          <Download className="size-4" aria-hidden />
          {csvStatus === 'loading' ? 'Exporting…' : 'Export CSV'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePngExport}
          disabled={pngStatus === 'loading'}
          className="gap-2"
          aria-label="Export dashboard as PNG"
        >
          <ImageIcon className="size-4" aria-hidden />
          {pngStatus === 'loading' ? 'Capturing…' : 'Export PNG'}
        </Button>
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        CSV includes all stored listens. PNG captures the dashboard view.
      </p>
    </div>
  )
}
