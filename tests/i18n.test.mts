import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BOUNDARY_TEXT, boundaryLocaleFromPath } from '../src/lib/boundary-text.ts'
import { inquiryReceivedCopy } from '../src/emails/inquiry-copy.ts'
import { LOCALES, DEFAULT_LOCALE, toLocale, localeAlternates } from '../src/i18n/locales.ts'

const load = (l: string) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), 'utf8').replace(/^﻿/, ''))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages = Object.fromEntries(LOCALES.map((l) => [l, load(l)])) as Record<(typeof LOCALES)[number], any>
const REFERENCE = 'en'
const others = LOCALES.filter((l) => l !== REFERENCE)

function flatten(o: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (Array.isArray(o)) o.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)))
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k))
  else out[prefix] = String(o)
  return out
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

test('locales: Italian is the default and unknown values fall back to it', () => {
  assert.equal(DEFAULT_LOCALE, 'it')
  assert.deepEqual([...LOCALES], ['it', 'en'])
  assert.equal(toLocale('en'), 'en')
  for (const v of ['mn', 'fr', '', null, undefined, 3]) assert.equal(toLocale(v), 'it')
})

test('hreflang alternates list every language plus x-default', () => {
  const a = localeAlternates('https://x.test', 'en', '/tours')
  assert.equal(a.canonical, 'https://x.test/en/tours')
  assert.deepEqual(a.languages, { it: 'https://x.test/it/tours', en: 'https://x.test/en/tours', 'x-default': 'https://x.test/it/tours' })
})

test('every language has exactly the same message keys as English', () => {
  const ref = flatten(messages[REFERENCE])
  for (const l of others) {
    const other = flatten(messages[l])
    const missing = Object.keys(ref).filter((k) => !(k in other))
    const extra = Object.keys(other).filter((k) => !(k in ref))
    assert.deepEqual({ l, missing, extra }, { l, missing: [], extra: [] })
  }
})

test('translations keep the same {placeholders} in every language', () => {
  const ref = flatten(messages[REFERENCE])
  for (const l of others) {
    const other = flatten(messages[l])
    const mismatched = Object.keys(ref).filter((k) => k in other && placeholders(ref[k]) !== placeholders(other[k]))
    assert.deepEqual(mismatched, [], l)
  }
})

test('no empty translations', () => {
  for (const l of LOCALES) {
    const empty = Object.entries(flatten(messages[l]))
      .filter(([, v]) => v.trim() === '')
      .map(([k]) => k)
    assert.deepEqual(empty, [], `${l} has empty strings`)
  }
})

test('the Italian file is really translated, not a copy of English', () => {
  const en = flatten(messages.en)
  const it = flatten(messages.it)
  const long = Object.keys(en).filter((k) => en[k].length > 40)
  const same = long.filter((k) => en[k] === it[k])
  assert.ok(same.length / long.length < 0.05, `too many untranslated strings: ${same.slice(0, 5).join(', ')}`)
})

test('error/404 pages pick the language from the URL', () => {
  assert.equal(boundaryLocaleFromPath('/en'), 'en')
  assert.equal(boundaryLocaleFromPath('/en/tours/x'), 'en')
  assert.equal(boundaryLocaleFromPath('/it/tours'), 'it')
  assert.equal(boundaryLocaleFromPath('/english-things'), 'it')
  assert.equal(boundaryLocaleFromPath(null), 'it')
  for (const l of LOCALES) assert.deepEqual(Object.keys(BOUNDARY_TEXT[l]), Object.keys(BOUNDARY_TEXT.en))
})

test('e-mail copy is complete in every language', () => {
  for (const l of LOCALES) {
    assert.deepEqual(Object.keys(inquiryReceivedCopy[l]).sort(), Object.keys(inquiryReceivedCopy.en).sort(), `received ${l}`)
    assert.match(inquiryReceivedCopy[l].subject('quote', 'Brand'), /Brand/)
  }
  assert.equal(inquiryReceivedCopy.en.travelersValue(1, 0), '1 adult')
  assert.equal(inquiryReceivedCopy.en.travelersValue(2, 1), '2 adults, 1 child')
  assert.equal(inquiryReceivedCopy.en.travelersValue(2, 3), '2 adults, 3 children')
  assert.equal(inquiryReceivedCopy.it.travelersValue(1, 0), '1 adulto')
  assert.equal(inquiryReceivedCopy.it.travelersValue(2, 1), '2 adulti, 1 bambino')
  assert.equal(inquiryReceivedCopy.it.travelersValue(2, 3), '2 adulti, 3 bambini')
})
