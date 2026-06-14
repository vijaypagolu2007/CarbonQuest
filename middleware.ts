import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password']
const ONBOARDING_ROUTES = ['/onboarding']
const DASHBOARD_ROUTES = ['/dashboard']

/**
 * Middleware handles auth redirects at the edge.
 * Firebase Auth state cannot be read server-side, so we use a
 * session cookie (`cq_authed`) that the client sets on sign-in.
 * Full protection is enforced client-side via ProtectedRoute.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthed = request.cookies.has('cq_authed')

  // Redirect authenticated users away from auth pages
  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard/world', request.url))
  }

  // Redirect unauthenticated users away from protected pages
  const isProtected =
    DASHBOARD_ROUTES.some((r) => pathname.startsWith(r)) ||
    ONBOARDING_ROUTES.some((r) => pathname.startsWith(r))

  if (isProtected && !isAuthed) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
}
