import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeSettings, parseSettingsInput, SETTINGS_DEFAULTS, socialLinks, telHref } from '../src/lib/site-settings.ts'
import { applyTextOverrides, conformToDefault } from '../src/lib/site-texts.ts'
import { galleryPath, mapPhoto, parsePhotoUpdate } from '../src/lib/photos.ts'

test('contact settings are cleaned and validated', () => {
  const r = parseSettingsInput({ phone: ' +976 9586 8948 ', whatsapp: '+976 (95) 86-8948', email: 'a@b.it', facebook: 'https://facebook.com/x', foundedYear: '2014', replyTime: { it: ' 1-2 giorni ', en: '' } })
  assert.ok(r.ok)
  if (!r.ok) return
  assert.equal(r.value.phone, '+976 9586 8948')
  assert.equal(r.value.whatsapp, '97695868948')
  assert.equal(r.value.foundedYear, 2014)
  assert.deepEqual(r.value.replyTime, { it: '1-2 giorni', en: '' })
})

test('bad settings are rejected with the field name', () => {
  assert.deepEqual(parseSettingsInput({ email: 'nope' }), { ok: false, error: 'email' })
  assert.deepEqual(parseSettingsInput({ email: '' }), { ok: false, error: 'email' }) // the public e-mail is required
  assert.deepEqual(parseSettingsInput({ notifyEmail: '' }).ok, true) // the alert inbox may be empty
  assert.deepEqual(parseSettingsInput({ facebook: 'javascript:alert(1)' }), { ok: false, error: 'facebook' })
  assert.deepEqual(parseSettingsInput({ foundedYear: 1200 }), { ok: false, error: 'foundedYear' })
  assert.equal(parseSettingsInput(null).ok, false)
})

test('saved settings sit over the defaults and bad saved values are ignored', () => {
  const m = mergeSettings({ phone: '+39 000', email: 'broken', instagram: 'https://instagram.com/x' })
  // one invalid field makes the whole saved object unusable, so nothing half-valid leaks in
  assert.deepEqual(m, mergeSettings(null))
  const ok = mergeSettings({ phone: '+39 000', instagram: 'https://instagram.com/x/' })
  assert.equal(ok.phone, '+39 000')
  assert.equal(ok.email, SETTINGS_DEFAULTS.email)
  assert.equal(ok.replyTime.it, SETTINGS_DEFAULTS.replyTime.it)
  assert.deepEqual(socialLinks(ok).map((x) => x.platform), ['instagram'])
  assert.equal(telHref('+976 9586 8948'), 'tel:+97695868948')
})

const BUILT_IN = { about: { title: 'Chi siamo', items: [{ a: 'x', b: 'y' }], tags: ['uno'] }, other: 'x' }

test('an edited text must keep the structure of the built-in text', () => {
  assert.deepEqual(conformToDefault({ title: 'Nuovo', items: [{ a: '1', b: '2' }, { a: '3', b: '4' }], tags: [] }, BUILT_IN.about as never), { title: 'Nuovo', items: [{ a: '1', b: '2' }, { a: '3', b: '4' }], tags: [] })
  assert.equal(conformToDefault({ title: 5 }, BUILT_IN.about as never) !== null, true) // a wrong field falls back to the built-in value
  assert.equal(conformToDefault('not an object', BUILT_IN.about as never), null)
  // a field of the wrong kind keeps its built-in value instead of breaking the page
  assert.deepEqual(conformToDefault({ title: 'x', items: 'nope', tags: [] }, BUILT_IN.about as never), { title: 'x', items: [{ a: 'x', b: 'y' }], tags: [] })
})

test('edited groups replace the built-in ones, unknown groups are ignored', () => {
  const out = applyTextOverrides({ about: { heroLabel: 'Chi siamo', story1: 'A' }, hero: { book: 'Vai' } }, { about: { heroLabel: 'Noi', story1: 'B' }, hero: 'broken', secret: { x: 1 } })
  assert.deepEqual(out.about, { heroLabel: 'Noi', story1: 'B' })
  assert.deepEqual(out.hero, { book: 'Vai' }) // does not fit: the built-in text stays
  assert.equal('secret' in out, false)
})

test('photo edits keep only known keys and valid values', () => {
  assert.deepEqual(parsePhotoUpdate({ caption: ' Gobi ', category: 'gobi', inGallery: false, featured: true, evil: 1 }), { ok: true, row: { caption: 'Gobi', category: 'gobi', in_gallery: false, featured: true } })
  assert.deepEqual(parsePhotoUpdate({ category: 'moon' }), { ok: false, error: 'category' })
  assert.match(galleryPath(new Date('2026-11-05T10:00:00Z'), 'abc12345'), /^gallery\/2026\/11\/\d+-abc12345\.jpg$/)
  assert.equal(mapPhoto({ id: '1', url: 'u', category: 'nope', in_gallery: null }).category, 'other')
})
