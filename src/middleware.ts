import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const host = request.headers.get('host')

  if (host?.startsWith('localhost:')) {
    const port = host.split(':')[1] ?? '3000'
    const url = request.nextUrl.clone()
    url.host = `127.0.0.1:${port}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
