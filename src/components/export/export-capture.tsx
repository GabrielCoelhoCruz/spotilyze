'use client'

import { type ReactNode } from 'react'

interface ExportCaptureProps {
  id: string
  children: ReactNode
}

export const ExportCapture = ({ id, children }: ExportCaptureProps) => (
  <div id={id}>{children}</div>
)
