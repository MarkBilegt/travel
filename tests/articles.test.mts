import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseArticleInput, parseBody, parseInline, slugify, getArticleField, isArticleTranslated, safeHref, videoEmbedUrl, plainText } from '../src/lib/articles.ts'

test('slugs are lowercase, accent-free and URL safe', () => {
  assert.equal(slugify('Gerelee and his wife!'), 'gerelee-and-his-wife')
  assert.equal(slugify('  L’Inverno è arrivato… '), 'l-inverno-e-arrivato')
  assert.equal(slugify('Ө Ү'), '')
})

test('an article needs a title, a slug and a category', () => {
  assert.deepEqual(parseArticleInput({ category: 'news' }), { ok: false, error: 'Title is required' })
  assert.deepEqual(parseArticleInput({ title: 'Ө Ү', category: 'news' }), { ok: false, error: 'Slug is required' })
  assert.deepEqual(parseArticleInput({ title: 'Ciao', category: 'nope' }), { ok: false, error: 'Category is required' })
  const r = parseArticleInput({ title: ' Ciao a tutti ', category: 'news', body: 'Testo', published: false, translations: { en: { title: 'Hello' }, it: { title: 'ignored' }, fr: { title: 'x' } } })
  assert.ok(r.ok)
  if (!r.ok) return
  assert.equal(r.row.slug, 'ciao-a-tutti')
  assert.equal(r.row.published, false)
  assert.deepEqual(r.row.translations, { en: { title: 'Hello' } })
})

test('partial updates keep only the keys sent', () => {
  const r = parseArticleInput({ published: false }, true)
  assert.deepEqual(r.ok && r.row, { published: false })
  assert.equal(parseArticleInput({ publishedAt: 'not a date' }, true).ok, false)
})

test('text falls back to the default language', () => {
  const a = { title: 'Ciao', summary: 'Riassunto', body: 'Corpo', translations: { en: { title: 'Hello' } } }
  assert.equal(getArticleField(a, 'title', 'en'), 'Hello')
  assert.equal(getArticleField(a, 'body', 'en'), 'Corpo')
  assert.equal(getArticleField(a, 'title', 'it'), 'Ciao')
  assert.equal(isArticleTranslated(a, 'en'), false)
  assert.equal(isArticleTranslated({ translations: { en: { title: 'a', body: 'b' } } }, 'en'), true)
})

test('the body format becomes blocks, never raw HTML', () => {
  const blocks = parseBody('## Titolo\n\nUn **testo** con *enfasi* e un [link](https://example.org).\n\n- uno\n- due\n\n1. primo\n2. secondo\n\n![Foto](https://sainsanaa.net/a.jpg)\n\n@[video](https://youtu.be/abcdefghijk)\n\n> citazione\n\n<script>alert(1)</script>')
  assert.deepEqual(blocks.map((b) => b.t), ['heading', 'p', 'list', 'list', 'image', 'video', 'quote', 'p'])
  const last = blocks[7]
  assert.ok(last.t === 'p' && last.v[0].t === 'text' && last.v[0].v === '<script>alert(1)</script>') // plain text, rendered escaped
  const p = blocks[1]
  assert.ok(p.t === 'p' && p.v.some((i) => i.t === 'bold') && p.v.some((i) => i.t === 'italic') && p.v.some((i) => i.t === 'link'))
})

test('unsafe links, images and videos are dropped', () => {
  assert.equal(safeHref('javascript:alert(1)'), null)
  assert.equal(safeHref('data:text/html,x'), null)
  assert.equal(safeHref('//evil.example'), null)
  assert.equal(safeHref('/it/tours'), '/it/tours')
  assert.equal(safeHref('mailto:a@b.it'), 'mailto:a@b.it')
  const bad = parseBody('![x](javascript:alert(1))\n\n![y](//evil.example/a.jpg)')
  assert.ok(bad.every((b) => b.t === 'p'), 'no image block for unsafe sources')
  assert.ok(!JSON.stringify(bad).includes('"href"'), 'no link was created')
  assert.equal(videoEmbedUrl('https://evil.example/watch?v=abc'), null)
  assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(videoEmbedUrl('https://vimeo.com/12345'), 'https://player.vimeo.com/video/12345')
  const inline = parseInline('[bad](javascript:alert(1)) ok')
  assert.ok(inline.every((i) => i.t === 'text'))
})

test('plain text previews strip the formatting', () => {
  assert.equal(plainText('## T\n\nUn **testo** [link](https://x.it) ![i](a.jpg)', 100), 'T Un testo link')
  assert.ok(plainText('a '.repeat(300), 50).endsWith('…'))
})
