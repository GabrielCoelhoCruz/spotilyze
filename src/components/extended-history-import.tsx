'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const ExtendedHistoryImport = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/import/extended-history', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Import Extended History
      </h3>
      <p className="text-sm text-neutral-400 mb-4">
        Upload your Extended Streaming History JSON from Spotify to import your complete listening history.
      </p>

      <div className="flex items-center gap-4">
        <label
          className={`
            inline-flex items-center gap-2 rounded-lg px-4 py-2
            bg-emerald-600 text-white font-medium
            hover:bg-emerald-500 transition-colors cursor-pointer
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {isUploading ? 'Importing...' : 'Choose JSON File'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>

        <span className="text-sm text-neutral-500">
          .json only
        </span>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-lg bg-emerald-900/30 border border-emerald-800 p-4"
          >
            <p className="text-sm text-emerald-400 font-medium">Import complete!</p>
            <p className="text-sm text-neutral-300 mt-1">
              Imported {result.imported.toLocaleString()} listens, skipped {result.skipped.toLocaleString()} duplicates
              from {result.total.toLocaleString()} total entries.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-lg bg-red-900/30 border border-red-800 p-4"
          >
            <p className="text-sm text-red-400 font-medium">Import failed</p>
            <p className="text-sm text-neutral-300 mt-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-xs text-neutral-500">
        <p>How to get your Extended Streaming History:</p>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Go to <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Spotify Privacy Settings</a></li>
          <li>Scroll to &quot;Download your data&quot;</li>
          <li>Select &quot;Extended streaming history&quot;</li>
          <li>Click &quot;Request data&quot; (takes up to 30 days)</li>
          <li>You&apos;ll receive a ZIP with JSON files</li>
        </ol>
      </div>
    </div>
  )
}
