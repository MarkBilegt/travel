import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shownStatus, spotsLeft, signupsNeeded, isJoinable, parseDepartureInput, mapDeparture } from '../src/lib/departures.ts'

const d = (over = {}) => ({ status: 'open' as const, minParticipants: 4, maxParticipants: 10, enrolled: 0, ...over })

test('status shown to visitors: open -> confirmed at the minimum -> full at the maximum', () => {
  assert.equal(shownStatus(d()), 'open')
  assert.equal(shownStatus(d({ enrolled: 3 })), 'open')
  assert.equal(shownStatus(d({ enrolled: 4 })), 'confirmed')
  assert.equal(shownStatus(d({ enrolled: 10 })), 'full')
  // the team can confirm early, or mark it full by hand
  assert.equal(shownStatus(d({ status: 'confirmed', enrolled: 1 })), 'confirmed')
  assert.equal(shownStatus(d({ status: 'full', enrolled: 1 })), 'full')
  // cancelled always wins
  assert.equal(shownStatus(d({ status: 'cancelled', enrolled: 10 })), 'cancelled')
})

test('spots left and sign-ups needed never go negative', () => {
  assert.equal(spotsLeft(d({ enrolled: 3 })), 7)
  assert.equal(spotsLeft(d({ enrolled: 12 })), 0)
  assert.equal(signupsNeeded(d({ enrolled: 1 })), 3)
  assert.equal(signupsNeeded(d({ enrolled: 9 })), 0)
})

test('only open and confirmed departures can be joined', () => {
  assert.equal(isJoinable(d()), true)
  assert.equal(isJoinable(d({ enrolled: 5 })), true)
  assert.equal(isJoinable(d({ enrolled: 10 })), false)
  assert.equal(isJoinable(d({ status: 'cancelled' })), false)
})

const TOUR = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

test('parseDepartureInput accepts a valid departure', () => {
  const r = parseDepartureInput({ tourId: TOUR, startDate: '2027-06-12', endDate: '2027-06-20', minParticipants: 4, maxParticipants: 10, price: '1990', status: 'open', notes: ' hi ' })
  assert.equal(r.ok, true)
  if (r.ok) assert.deepEqual(r.row, { tour_id: TOUR, start_date: '2027-06-12', end_date: '2027-06-20', min_participants: 4, max_participants: 10, price: 1990, status: 'open', notes: 'hi' })
})

test('parseDepartureInput rejects bad input', () => {
  const ok = { tourId: TOUR, startDate: '2027-06-12', endDate: '2027-06-20' }
  assert.equal(parseDepartureInput({ ...ok, tourId: 'x' }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, startDate: '2027-02-30' }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, startDate: '12/06/2027' }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, endDate: '2027-06-01' }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, minParticipants: 8, maxParticipants: 4 }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, status: 'maybe' }).ok, false)
  assert.equal(parseDepartureInput({ ...ok, price: -1 }).ok, false)
})

test('partial updates only validate the fields present', () => {
  const r = parseDepartureInput({ enrolled: 5 }, true)
  assert.deepEqual(r.ok && r.row, { enrolled: 5 })
  assert.equal(parseDepartureInput({ enrolled: -1 }, true).ok, false)
  assert.equal(parseDepartureInput({ startDate: '2027-06-12', endDate: '2027-06-01' }, true).ok, false)
})

test('mapDeparture maps a database row', () => {
  const m = mapDeparture({ id: 'a', tour_id: 'b', start_date: '2027-06-12', end_date: '2027-06-20', price: null, min_participants: 2, max_participants: 8, enrolled: null, status: 'open', notes: null })
  assert.deepEqual(m, { id: 'a', tourId: 'b', startDate: '2027-06-12', endDate: '2027-06-20', price: undefined, minParticipants: 2, maxParticipants: 8, enrolled: 0, status: 'open', notes: undefined })
})
