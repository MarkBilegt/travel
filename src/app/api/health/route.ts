import { NextResponse } from 'next/server'

/** GET /api/health: for uptime monitors. Says the server is up; reveals nothing else. */
export function GET() {
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
