import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseTestimonialInput, mapTestimonial } from '../src/lib/testimonials.ts'

test('a review needs a name and a real quote', () => {
  assert.deepEqual(parseTestimonialInput({ quote: 'Wonderful trip!' }), { ok: false, error: 'Name is required' })
  assert.deepEqual(parseTestimonialInput({ name: 'Anna', quote: 'ok' }), { ok: false, error: 'The review needs at least 10 characters' })
  assert.equal(parseTestimonialInput(null).ok, false)
})

test('defaults: not consented means not published', () => {
  const r = parseTestimonialInput({ name: ' Anna ', quote: 'A wonderful trip across the Gobi', language: 'fr', rating: 9 })
  assert.ok(r.ok)
  if (!r.ok) return
  assert.equal(r.row.name, 'Anna')
  assert.equal(r.row.language, 'it')
  assert.equal(r.row.rating, null)
  assert.equal(r.row.consent_given, false)
  assert.equal(r.row.active, false)
})

test('consent plus active publishes; removing consent unpublishes', () => {
  const on = parseTestimonialInput({ name: 'Anna', quote: 'A wonderful trip across the Gobi', consentGiven: true, rating: 5, language: 'en' })
  assert.ok(on.ok && on.row.active === true && on.row.consent_given === true && on.row.rating === 5 && on.row.language === 'en')
  const off = parseTestimonialInput({ consentGiven: false, active: true }, true)
  assert.ok(off.ok && off.row.active === false)
})

test('partial updates return only the keys present', () => {
  const r = parseTestimonialInput({ active: false }, true)
  assert.deepEqual(r.ok && r.row, { active: false })
})

test('rows map to the public shape', () => {
  const t = mapTestimonial({ id: '1', name: 'A', quote: 'q', language: 'en', rating: 4, consent_given: true, active: true, sort_order: '2' })
  assert.deepEqual(t, { id: '1', name: 'A', country: null, quote: 'q', language: 'en', rating: 4, trip: null, consentGiven: true, active: true, sortOrder: 2 })
})
