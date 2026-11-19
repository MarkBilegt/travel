import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ADMIN_COOKIE, verifyAdminSession } from './lib/admin-session'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle admin routes - check Supabase admin role
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Verify JWT admin session cookie (role, issuer, audience, expiry)
    if (await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
      return NextResponse.next()
    }

    // Check Supabase role
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      },
    )
    const { data: { user: adminUser } } = await adminSupabase.auth.getUser()
    if (adminUser?.app_metadata?.role === 'admin') {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Skip API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Visitors have no accounts: only the language prefix needs handling.
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
