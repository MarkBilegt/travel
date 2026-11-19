import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/admin-session'

// The admin_session cookie is httpOnly, so it can only be cleared server-side.
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
