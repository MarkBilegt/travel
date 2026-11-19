import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, safeEqual, sanitizeSearchTerm, createRateLimiter, getClientIp } from '../src/lib/security.ts'

test('escapeHtml neutralises tags, quotes and ampersands', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>"\'&'), '&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&amp;')
  assert.equal(escapeHtml(null), '')
  assert.equal(escapeHtml(42), '42')
})

test('sanitizeSearchTerm strips PostgREST filter syntax but keeps Cyrillic', () => {
  const cleaned = sanitizeSearchTerm('Bat%,id.eq.1),(booking_status.eq.paid')
  assert.doesNotMatch(cleaned, /[,()%]/)
  assert.equal(sanitizeSearchTerm('  Болд   Бат '), 'Болд Бат')
  assert.equal(sanitizeSearchTerm(null), '')
  assert.equal(sanitizeSearchTerm('x'.repeat(500)).length, 80)
})

test('safeEqual compares in constant time and handles different lengths', () => {
  assert.ok(safeEqual('abc', 'abc'))
  assert.ok(!safeEqual('abc', 'abd'))
  assert.ok(!safeEqual('abc', 'abcd'))
  assert.ok(!safeEqual('', 'x'))
})

test('rate limiter: per-key limit, global ceiling, blocked keys do not burn the global budget', () => {
  const l = createRateLimiter({ limit: 2, windowMs: 60_000, globalLimit: 3 })
  assert.deepEqual([l.check('a'), l.check('a'), l.check('a')], [true, true, false])
  // 'a' used 2 of the 3 global slots (its blocked 3rd attempt must not count)
  assert.deepEqual([l.check('b'), l.check('c')], [true, false])
})

test('getClientIp prefers proxy-set headers', () => {
  const req = (h: Record<string, string>) => new Request('http://x', { headers: h })
  assert.equal(getClientIp(req({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9, 8.8.8.8' })), '1.1.1.1')
  assert.equal(getClientIp(req({ 'x-forwarded-for': '9.9.9.9, 8.8.8.8' })), '9.9.9.9')
  assert.equal(getClientIp(req({})), 'unknown')
})
