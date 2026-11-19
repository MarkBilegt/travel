import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeRedirectPath, formatPrice } from '../src/lib/utils.ts'

test('safeRedirectPath allows same-origin relative paths', () => {
  assert.equal(safeRedirectPath('/mn/account', '/mn'), '/mn/account')
  assert.equal(safeRedirectPath('/en/tours?x=1#a', '/mn'), '/en/tours?x=1#a')
})

test('safeRedirectPath rejects open-redirect attempts', () => {
  for (const evil of ['@evil.com', '//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null, undefined]) {
    assert.equal(safeRedirectPath(evil, '/mn'), '/mn', `should reject ${String(evil)}`)
  }
})

test('formatPrice formats EUR (default) and USD per language', () => {
  assert.equal(formatPrice(5890, 'EUR', 'en'), '€5,890')
  assert.equal(formatPrice(1200, 'USD', 'en'), 'US$1,200')
  // Italian: euro sign after the number, dot as thousands separator from 5 digits
  assert.match(formatPrice(5890, 'EUR', 'it'), /^5\.?890\s€$/)
  assert.match(formatPrice(12890, 'EUR', 'it'), /^12\.890\s€$/)
  // unknown language falls back to the default (Italian)
  assert.equal(formatPrice(100, 'EUR', 'xx'), formatPrice(100, 'EUR', 'it'))
})
