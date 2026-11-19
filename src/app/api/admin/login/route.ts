import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, signAdminSession } from '@/lib/admin-session'
import { createRateLimiter, getClientIp, safeEqual } from '@/lib/security'

// 5 tries per IP per 15 min, plus a global ceiling so rotating IPs (or spoofed
// forwarding headers) cannot brute-force the shared password.
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000, globalLimit: 30 })
const MIN_PASSWORD_LENGTH = 12

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(req: NextRequest) {
  try {
    if (!limiter.check(getClientIp(req))) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429 },
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || adminPassword.length < MIN_PASSWORD_LENGTH || !process.env.ADMIN_JWT_SECRET) {
      console.error(`ADMIN_PASSWORD (min ${MIN_PASSWORD_LENGTH} chars) and ADMIN_JWT_SECRET (min 32 chars) must be set`)
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const body = await req.json().catch(() => null)
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!safeEqual(password, adminPassword)) {
      await sleep(400) // slow down guessing
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signAdminSession()
    if (!token) {
      console.error('ADMIN_JWT_SECRET must be at least 32 characters')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      maxAge: ADMIN_SESSION_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
