import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LEGACY_REDIRECTS } from '../src/lib/legacy-redirects.ts'

test('every legacy redirect lands on an Italian page', () => {
  for (const { destination } of LEGACY_REDIRECTS) assert.match(destination, /^\/it(\/|#|$)/, destination)
})

test('no source is listed twice and none points at itself', () => {
  const sources = LEGACY_REDIRECTS.map((x) => x.source)
  assert.equal(new Set(sources).size, sources.length)
  for (const { source, destination } of LEGACY_REDIRECTS) assert.notEqual(source, destination)
})

test('sources never collide with the new site routes', () => {
  const NEW_PREFIXES = ['/it', '/en', '/admin', '/api', '/tours', '/departures', '/info', '/culture', '/about', '/contact', '/services']
  for (const { source } of LEGACY_REDIRECTS) {
    for (const p of NEW_PREFIXES) assert.ok(source !== p && !source.startsWith(`${p}/`), `${source} shadows ${p}`)
  }
})

test('the known old pages are covered', () => {
  const sources = new Set(LEGACY_REDIRECTS.map((x) => x.source))
  for (const s of ['/about-us', '/il-visto', '/travels', '/la-storia', '/dicono-di-noi', '/assicurazione-di-viaggio-per-la-mongolia']) assert.ok(sources.has(s), s)
})
