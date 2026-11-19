import { createHash, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

/** Escape text before putting it into hand-written email/HTML templates. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Constant-time string comparison (hashing first makes lengths equal). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

/**
 * Make free text safe to splice into a PostgREST filter string such as
 * `.or('name.ilike.%term%')`. Commas, parentheses, quotes and wildcards are
 * filter syntax there, so they are removed rather than escaped.
 */
export function sanitizeSearchTerm(input: string | null | undefined, maxLength = 80): string {
  return (input ?? '')
    .replace(/[,()*%\\"'`:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}


/**
 * Best-effort client IP. Prefer headers set by the hosting proxy
 * (x-real-ip / Vercel), fall back to the first x-forwarded-for hop.
 * Note: on a self-hosted server without a trusted proxy these can be spoofed,
 * so rate limits below also keep a global ceiling.
 */
export function getClientIp(request: NextRequest | Request): string {
  const h = request.headers
  return (
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

type Bucket = { count: number; start: number }

/**
 * Small fixed-window rate limiter. In-memory, so it is per server instance and
 * resets on deploy: fine as a first line of defence, but use a shared store
 * (e.g. Upstash Redis) for real multi-instance limits.
 */
export function createRateLimiter({ limit, windowMs, globalLimit }: { limit: number; windowMs: number; globalLimit?: number }) {
  const buckets = new Map<string, Bucket>()
  const hit = (key: string, max: number) => {
    const now = Date.now()
    const b = buckets.get(key)
    if (!b || now - b.start > windowMs) {
      buckets.set(key, { count: 1, start: now })
      return true
    }
    if (b.count >= max) return false
    b.count++
    return true
  }
  return {
    /** Returns true when the request is allowed. */
    check(key: string): boolean {
      if (buckets.size > 10_000) buckets.clear() // keep memory bounded
      // Per-key first: attempts already blocked for one IP must not use up the
      // global budget (otherwise one client could lock everyone out).
      if (!hit(key, limit)) return false
      if (globalLimit !== undefined && !hit('__global__', globalLimit)) return false
      return true
    },
  }
}
