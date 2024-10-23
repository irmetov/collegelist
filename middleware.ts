import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For now, we'll just check if the user has a session cookie
  // In a real app, you'd want to verify this token with Firebase
  const sessionCookie = request.cookies.get('session')?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}