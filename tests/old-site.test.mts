import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cleanMarkdown, parseDays, parseTripHeader, planFor, slugForPost, tidyTitle, summaryOf, type Crawled } from '../scripts/old-site/convert.mts'

const site: Crawled[] = JSON.parse(readFileSync(new URL('../scripts/old-site/data/site.json', import.meta.url), 'utf8'))
const byPath = (p: string) => site.find((i) => i.path === p)!

test('every crawled page is either imported or skipped on purpose', () => {
  const plans = site.map((i) => ({ i, p: planFor(i) }))
  const unmapped = plans.filter((x) => x.p.type === 'skip' && x.p.reason === 'Not mapped').map((x) => x.i.path)
  assert.deepEqual(unmapped, [])
  const counts = { article: 0, gallery: 0, tour: 0, skip: 0 }
  for (const x of plans) counts[x.p.type]++
  assert.ok(counts.article >= 60, `articles: ${counts.article}`)
  assert.equal(counts.gallery, 3)
  assert.equal(counts.tour, 2)
})

test('article addresses are unique and URL safe', () => {
  const slugs = site.map((i) => planFor(i)).filter((p) => p.type === 'article').map((p) => (p as { slug: string }).slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/)
})

test('numeric post addresses get a readable slug', () => {
  const post = byPath('2014/05/18/783')
  assert.ok(post)
  assert.match(slugForPost(post), /^[a-z0-9-]{6,}$/)
  assert.notEqual(slugForPost(post), '783')
})

test('SHOUTING titles become sentence case, normal ones stay', () => {
  assert.equal(tidyTitle('TREKKING A CAVALLO DAGLI TSAATAN'), 'Trekking a cavallo dagli tsaatan')
  assert.equal(tidyTitle('Il visto'), 'Il visto')
  assert.equal(tidyTitle('  Acqua da un pozzo Marzo 2014 '), 'Acqua da un pozzo Marzo 2014')
})

test('markdown cleaning moves pictures, fixes links and removes debris', () => {
  const out = cleanMarkdown(
    ['[', '', '![dsc_1995.jpg](https://sainsanaa.net/wp-content/uploads/2014/10/dsc_1995.jpg)', '', '](https://sainsanaa.net/2014/10/dsc_1995/)', '', 'Vedi [il visto](https://sainsanaa.net/il-visto/) e [altro](https://sainsanaa.net/boh/) e [sito](https://example.org/x).', '', '***Clima***', '\n\n\n[', ']'].join('\n'),
    { image: (u) => u.replace('https://sainsanaa.net/wp-content/uploads/', '/media/'), link: (u) => (u.includes('il-visto') ? '/info/il-visto' : null) },
  )
  assert.match(out, /!\[dsc 1995\]\(\/media\/2014\/10\/dsc_1995\.jpg\)/)
  assert.ok(!out.includes('sainsanaa.net'))
  assert.match(out, /\[il visto\]\(\/info\/il-visto\)/)
  assert.match(out, /e altro e/)
  assert.match(out, /\[sito\]\(https:\/\/example\.org\/x\)/)
  assert.match(out, /\*\*Clima\*\*/)
  assert.ok(!/^[\[\]]$/m.test(out))
})

test('trip header facts are read from the page text', () => {
  const gran = parseTripHeader(byPath('il-gran-tour-della-mongolia').md)
  assert.equal(gran.price, 1790)
  assert.equal(gran.currency, 'EUR')
  assert.equal(gran.singleSupplement, 330)
  assert.equal(gran.maxPeople, 14)
  assert.equal(gran.start, '2027-08-01')
  assert.equal(gran.end, '2027-08-18')
})

test('the day-by-day programme is found on trip pages', () => {
  const gran = parseDays(byPath('il-gran-tour-della-mongolia').md)
  assert.ok(gran.length >= 14, `days: ${gran.length}`)
  assert.ok(gran[0].description.length > 20)
  const santo = parseDays(byPath('travels/il-grande-santo').md)
  assert.equal(santo.length, 14)
  assert.deepEqual(santo.slice(0, 3).map((d) => d.day), [1, 2, 3])
})

test('summaries are short plain text', () => {
  const s = summaryOf('## Titolo\n\n![x](/a.jpg)\n\nUn **testo** lungo '.repeat(1) + 'parola '.repeat(80))
  assert.ok(s.length <= 221 && !s.includes('**') && !s.includes('!['))
})
