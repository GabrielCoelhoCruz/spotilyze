import { NextResponse } from 'next/server'

import { clearSession } from '@/lib/crypto/state'

export const POST = async (request: Request): Promise<NextResponse> => {
  await clearSession()
  return NextResponse.redirect(new URL('/', request.url))
}
