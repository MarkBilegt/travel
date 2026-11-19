// Mirrors the @theme tokens in src/app/globals.css (for places that need raw
// hex values, e.g. emails and OG images). Keep both in sync.
export const BRAND_COLORS = {
  blue: '#1E5B66',
  gold: '#E2733A',
  goldDeep: '#A84E1F',
  navy: '#0E1A22',
  cream: '#F5F0E8',
  white: '#FFFFFF',
  adminAccent: '#4f7ef7',
} as const

// ─── Client details ─────────────────────────────────────────────────────────
// TODO(client): every value below is a placeholder. Replace with the client's
// real details. Translations in messages/*.json use the same placeholder
// name ("Brand Travel"), so search-and-replace that too.
export const SITE_CONFIG = {
  name: 'Sain Sanaa',
  legalName: 'Sain Sanaa Cooperativa Mongolia',
  domain: 'sainsanaa.net',
  email: 'sainsanaaviaggi@gmail.com',
  // Sender address for transactional email (must be verified in Resend)
  emailFrom: 'noreply@sainsanaa.net',
  phone: '+976 9586 8948', // also Viber, WhatsApp and WeChat
  // WhatsApp number in international format, digits only
  whatsapp: '97695868948',
  // Viber uses the same number as WhatsApp
  viber: 'viber://chat?number=%2B97695868948',
  foundedYear: 2014, // the first trips on the old site are dated 2014: confirm with the cooperative
  // Default currency for new tours; each tour stores its own (EUR or USD)
  currency: 'EUR',
  // TODO(client): add the office street address if the cooperative wants it shown.
  address: 'Ulaanbaatar, Mongolia',
  // Google Maps search used by the contact page map (place name or "lat,lng")
  mapQuery: 'Ulaanbaatar, Mongolia',
  // TODO(client): add the cooperative's Facebook / Instagram / YouTube pages if it has them.
  socialLinks: {} as Partial<Record<'facebook' | 'instagram' | 'youtube', string>>,
} as const

/** Canonical site origin without trailing slash, e.g. https://example.com */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || `https://${SITE_CONFIG.domain}`).replace(/\/+$/, '')


/**
 * Regions of Mongolia used to group and filter tours. Keys are stable ASCII ids
 * stored on the tour (DB column `country` until the Phase 3 schema reset);
 * public labels live in messages/*.json under tours.regionLabels, the
 * Mongolian-only admin uses label below.
 */
export const MONGOLIA_REGIONS = [
  { key: 'ulaanbaatar', label: 'Улаанбаатар' },
  { key: 'central', label: 'Төв нутаг' },
  { key: 'gobi', label: 'Говь' },
  { key: 'khangai', label: 'Хангай, Орхон хөндий' },
  { key: 'khuvsgul', label: 'Хөвсгөл' },
  { key: 'altai', label: 'Алтай, баруун Монгол' },
  { key: 'east', label: 'Дорнод хээр' },
] as const

export type RegionKey = (typeof MONGOLIA_REGIONS)[number]['key']

export const TOUR_CATEGORIES = [
  { value: 'adventure', label: 'Адал явдал' },
  { value: 'cultural', label: 'Соёл' },
  { value: 'nature', label: 'Байгаль' },
  { value: 'luxury', label: 'Тансаг' },
  { value: 'family', label: 'Гэр бүл' },
] as const

export const TOUR_DIFFICULTIES = [
  { value: 'easy', label: 'Хялбар' },
  { value: 'moderate', label: 'Дунд' },
  { value: 'challenging', label: 'Хэцүү' },
] as const

