import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-session'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  // Method 1: JWT admin_session cookie (password-based login)
  if (await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) return true

  // Method 2: Supabase user with admin role (mirrors middleware logic)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: () => {},
          },
        },
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.app_metadata?.role === 'admin') return true
    } catch {
      // Supabase check failed
    }
  }

  return false
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      },
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export function snakeToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(snakeToCamel)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        toCamel(k),
        snakeToCamel(v),
      ])
    )
  }
  return obj
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, meta?: object): NextResponse {
  return NextResponse.json({ data, ...meta })
}

export function paginate(
  page: number,
  limit: number
): { from: number; to: number } {
  return { from: (page - 1) * limit, to: page * limit - 1 }
}
