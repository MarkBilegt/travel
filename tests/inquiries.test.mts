import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInquiryInput, parseInquiryUpdate, enrolledFromSignups } from '../src/lib/inquiries.ts'

const ID = '123e4567-e89b-42d3-a456-426614174000'

test('a quote request is cleaned and defaults are applied', () => {
  const r = parseInquiryInput({ name: '  Anna Rossi ', email: 'anna@example.it', interests: ['hiking', 'bungee', 'hiking'], budgetPerDay: '120', locale: 'fr' })
  assert.ok(r.ok)
  if (!r.ok) return
  assert.equal(r.value.kind, 'quote')
  assert.equal(r.value.name, 'Anna Rossi')
  assert.deepEqual(r.value.interests, ['hiking'])
  assert.equal(r.value.budgetPerDay, 120)
  assert.equal(r.value.locale, 'it')
  assert.equal(r.value.adults, 1)
  assert.equal(r.value.children, 0)
  assert.equal(r.value.message, null)
})

test('bad input is rejected with the offending field', () => {
  assert.deepEqual(parseInquiryInput(null), { ok: false, error: 'Invalid body' })
  assert.deepEqual(parseInquiryInput({ name: 'A', email: 'a@b.it' }), { ok: false, error: 'name' })
  assert.deepEqual(parseInquiryInput({ name: 'Anna', email: 'not-an-email' }), { ok: false, error: 'email' })
  assert.deepEqual(parseInquiryInput({ name: 'Anna', email: 'a@b.it', travelFrom: '2027-07-10', travelTo: '2027-07-01' }), { ok: false, error: 'dates' })
})

test('a sign-up needs a departure; ids and counts are validated', () => {
  assert.deepEqual(parseInquiryInput({ kind: 'signup', name: 'Anna', email: 'a@b.it' }), { ok: false, error: 'departureId' })
  const r = parseInquiryInput({ kind: 'signup', name: 'Anna', email: 'a@b.it', departureId: ID, tourId: 'nope', adults: 99, children: '2' })
  assert.ok(r.ok)
  if (!r.ok) return
  assert.equal(r.value.departureId, ID)
  assert.equal(r.value.tourId, null)
  assert.equal(r.value.adults, 1) // out of range -> default
  assert.equal(r.value.children, 2)
})

test('only confirmed sign-ups count towards a departure', () => {
  assert.equal(
    enrolledFromSignups([
      { status: 'confirmed', adults: 2, children: 1 },
      { status: 'new', adults: 4, children: 0 },
      { status: 'lost', adults: 1, children: 0 },
      { status: 'confirmed', adults: 1, children: 0 },
    ]),
    4,
  )
  assert.equal(enrolledFromSignups([]), 0)
})

test('admin updates keep only known, valid keys', () => {
  assert.deepEqual(parseInquiryUpdate({ status: 'quoted', isRead: true, adminNotes: ' call back ', departureId: ID, evil: 1 }), {
    status: 'quoted', is_read: true, admin_notes: 'call back', departure_id: ID,
  })
  assert.deepEqual(parseInquiryUpdate({ status: 'bogus', departureId: 'x', adminNotes: '' }), { admin_notes: null, departure_id: null })
  assert.deepEqual(parseInquiryUpdate('x'), {})
})
