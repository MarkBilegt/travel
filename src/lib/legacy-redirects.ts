/**
 * Permanent redirects from the old WordPress site (sainsanaa.net) to the new
 * pages, so existing Google rankings and inbound links are kept. The old site
 * had no language prefix and was Italian only, so everything lands on /it.
 * Built from the old site's own sitemap. When the real domain and the final
 * tour slugs are known, point individual old trip pages at their new tour.
 * Pure data: used by next.config.ts and by tests.
 */

import { GENERATED_REDIRECTS } from './legacy-redirects.generated.ts'

export interface LegacyRedirect {
  source: string
  destination: string
}

const r = (source: string, destination: string): LegacyRedirect => ({ source, destination })

/** Old trip and event pages without a matching new tour: they go to the tours list. */
const OLD_TRIP_PAGES = [
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi-piste-sconosciute-dellovest',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi-gobi-il-grande-deserto',
  '/i-viaggi-di-sain-sana-con-amitaba-viaggio-festival-del-naadam',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi-profondo-gobi',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi-scoprire-lamongolia',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggi-conoscere-la-mongolia',
  '/i-viaggi-di-sain-sanaa-con-amitaba-viaggu',
  '/le-terre-del-signore-oceanico-un-itinerario-storico-e-naturalistico-nel-cuore-della-cultura-mongola-2017',
  '/gli-altai-terra-dei-kazaki-2016',
  '/mongolia-senza-confini-gobi-altai-e-grandi-laghi-la-vastita-infinita-del-mondo-dei-nomadi-2018',
  '/lanello-doro-della-mongolia-dal-4-al-24-agosto-2018',
  '/il-grande-anellodall-22-agosto-al-12-settembre-2022',
  '/trekking-a-cavallo-dagli-tsaatan',
  '/trekking-a-cavallo-dagli-tsaatan-tra-gli-allevatori-di-renne-della-taiga-mongola-dal-26-agosto-al-10-settembre',
  '/il-grande-festival-delle-aquile-nel-bayan-olgi-dal-28-settembre-al-9-ottobre',
  '/il-gran-tour-della-mongolia',
  '/la-cultura-nomade-e-il-festival-del-naadam-2018',
  '/steppe-e-deserto-del-gobi-alla-scoperta-del-paese-di-gengis-khaan-dal-2-al-15-giugno-2024',
]

const MANUAL: LegacyRedirect[] = [
  // Main pages
  r('/about-us', '/it/about'),
  r('/contatti', '/it/contact'),
  r('/contactus', '/it/contact'),
  // Old trip pages that now have a matching tour
  r('/travels/viaggi-di-5-giorni-nel-nella-steppa-e-nel-medio-gobi', '/it/tours/steppa-e-medio-gobi-5-giorni'),
  r('/travels/mongolia-viaggio-breve-di-7-giorni', '/it/tours/mongolia-viaggio-breve-7-giorni'),
  r('/travels/viaggio-di-8-giorni-nella-regione-centrale-della-mongolia', '/it/tours/mongolia-centrale-8-giorni'),
  r('/travels/mongolia-viaggio-di-14-giorni-nel-centro-sud', '/it/tours/gobi-e-orkhon-14-giorni'),
  r('/travels/il-grande-ovest-e-le-montagne-degli-altai', '/it/tours/grande-ovest-e-altai'),
  r('/travels/i-cavalli-della-mongolia', '/it/tours/i-cavalli-della-mongolia'),
  r('/travels/mongolia-18-giorni-dalle-steppe-al-deserto', '/it/tours/dalle-steppe-al-deserto-18-giorni'),
  r('/tour-di-un-giorno-a-ulaanbaatar', '/it/tours/ulaanbaatar-in-un-giorno'),
  r('/tour-di-un-giorno-monastero-di-manzushir-passeggiata-vetta-tsetse-gun', '/it/tours/manzushir-e-vetta-tsetsguun'),
  r('/travels', '/it/tours'),
  r('/travels/:slug*', '/it/tours'),
  r('/cerco-compagni-di-viaggio', '/it/departures'),
  r('/partenze-speciali-estate-2018', '/it/departures'),
  r('/feste-estate-2017', '/it/departures'),

  // Practical information
  r('/services-2', '/it/info'),
  r('/services-2/:slug*', '/it/info'),
  r('/il-visto', '/it/info#visa'),
  r('/assicurazione-di-viaggio-per-la-mongolia', '/it/info#insurance'),
  r('/orario-treni-nazionali-2016', '/it/info#getting-there'),

  // Culture and history
  r('/la-storia', '/it/culture/history'),
  r('/la-storia/:slug*', '/it/culture/history'),
  r('/tradizioni-e-religione/la-gher', '/it/culture/ger'),
  r('/tradizioni-e-religione/la-cucina-mongola', '/it/culture/food'),
  r('/tradizioni-e-religione/il-buddismo-in', '/it/culture/religion'),
  r('/tradizioni-e-religione/il-simbolo-del-soyombo', '/it/culture'),
  r('/tradizioni-e-religione', '/it/culture'),
  r('/tradizioni-e-religione/:slug*', '/it/culture'),
  r('/cultura', '/it/culture'),
  r('/la-macchia-mongolica', '/it/culture'),
  r('/letture-consigliate', '/it/culture'),
  r('/category/:slug*', '/it/culture'),
  // Old dated news posts (/2014/04/07/title)
  r('/:year(20\\d{2})/:month(\\d{2})/:day(\\d{2})/:slug', '/it/culture'),

  // Reviews, media and maps
  r('/dicono-di-noi', '/it#testimonials'),
  r('/photos', '/it'),
  r('/photos/:slug*', '/it'),
  r('/musica-e-video', '/it'),
  r('/mappa', '/it'),

  ...OLD_TRIP_PAGES.map((p) => r(p, '/it/tours')),
]

// Every old page that became an article, generated from the crawl. They win over the manual rules above.
const generated = GENERATED_REDIRECTS.map(([source, destination]) => r(source, destination))
const generatedSources = new Set(generated.map((x) => x.source))

export const LEGACY_REDIRECTS: LegacyRedirect[] = [...generated, ...MANUAL.filter((x) => !generatedSources.has(x.source))]
