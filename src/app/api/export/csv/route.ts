import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/session'
import { buildCsvContent, fetchListenRowsForExport } from '@/lib/export/csv'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const GET = async (request: Request): Promise<NextResponse> => {
  const ip = getClientIp(request)
  const limit = checkRateLimit(`export-csv:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const rows = await fetchListenRowsForExport(user.id)
  const csv = buildCsvContent(rows)
  const filename = `spotilyze-listens-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
