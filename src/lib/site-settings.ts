/**
 * Contact and company details the cooperative can change in the admin panel
 * (stored in the site_settings table, key "site"). The values in SITE_CONFIG
 * are only the defaults used until something is saved.
 * Pure module: no framework imports, so tests, server and client can share it.
 */

export interface SiteSettings {
  /** Main phone, shown everywhere (also Viber / WhatsApp / WeChat when those are the same number) */
  phone: string
  /** A second number, optional */
  phone2: string
  /** WhatsApp number, digits only, international format (97695868948) */
  whatsapp: string
  /** Viber number, digits only (usually the same as WhatsApp) */
  viber: string
  wechat: string
  skype: string
  /** Public e-mail address */
  email: string
  /** Inbox that receives request alerts (empty = same as the public e-mail) */
  notifyEmail: string
  address: string
  /** Free text under "Where we are" (for example "Meetings by appointment") */
  addressNote: string
  /** Free text for the reply-time card, per language */
  replyTime: { it: string; en: string }
  /** Google Maps search text for the contact page map */
  mapQuery: string
  facebook: string
  instagram: string
  youtube: string
  foundedYear: number
  /** Line in the footer, e.g. company registration and tax numbers */
  legalLine: string
}

export type SettingsKey = keyof SiteSettings

export const SETTINGS_DEFAULTS: SiteSettings = {
  phone: '+976 9586 8948',
  phone2: '',
  whatsapp: '97695868948',
  viber: '97695868948',
  wechat: '',
  skype: 'gengiskhaan',
  email: 'sainsanaaviaggi@gmail.com',
  notifyEmail: '',
  address: 'Ulaanbaatar, Mongolia',
  addressNote: '',
  replyTime: { it: 'Entro 1–2 giorni lavorativi', en: 'Within 1–2 working days' },
  mapQuery: 'Ulaanbaatar, Mongolia',
  facebook: '',
  instagram: '',
  youtube: '',
  foundedYear: 2014,
  legalLine: '',
}

const str = (v: unknown, max: number): string | null => (typeof v === 'string' ? v.trim().slice(0, max) : null)
const digits = (v: unknown): string | null => (typeof v === 'string' ? v.replace(/\D/g, '').slice(0, 20) : null)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const httpUrl = (v: unknown): string | null => {
  const s = str(v, 300)
  if (s === null) return null
  if (s === '') return ''
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

export type SettingsResult = { ok: true; value: Partial<SiteSettings> } | { ok: false; error: string }

/** Admin form body -> cleaned settings (only the keys present). */
export function parseSettingsInput(body: unknown): SettingsResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>
  const out: Partial<SiteSettings> = {}

  for (const k of ['phone', 'phone2', 'wechat', 'skype', 'address', 'addressNote', 'mapQuery', 'legalLine'] as const) {
    if (k in b) {
      const v = str(b[k], 300)
      if (v === null) return { ok: false, error: k }
      out[k] = v
    }
  }
  for (const k of ['whatsapp', 'viber'] as const) {
    if (k in b) {
      const v = digits(b[k])
      if (v === null) return { ok: false, error: k }
      out[k] = v
    }
  }
  for (const k of ['email', 'notifyEmail'] as const) {
    if (k in b) {
      const v = str(b[k], 200)
      if (v === null || (v !== '' && !EMAIL.test(v)) || (k === 'email' && v === '')) return { ok: false, error: k }
      out[k] = v
    }
  }
  for (const k of ['facebook', 'instagram', 'youtube'] as const) {
    if (k in b) {
      const v = httpUrl(b[k])
      if (v === null) return { ok: false, error: k }
      out[k] = v
    }
  }
  if ('foundedYear' in b) {
    const n = Number(b.foundedYear)
    if (!Number.isInteger(n) || n < 1900 || n > 2100) return { ok: false, error: 'foundedYear' }
    out.foundedYear = n
  }
  if ('replyTime' in b) {
    const r = b.replyTime as Record<string, unknown> | null
    out.replyTime = { it: str(r?.it, 200) ?? '', en: str(r?.en, 200) ?? '' }
  }
  return { ok: true, value: out }
}

/** Saved row (any shape) over the defaults. Unknown or invalid values are ignored. */
export function mergeSettings(saved: unknown): SiteSettings {
  const parsed = parseSettingsInput(saved && typeof saved === 'object' ? saved : {})
  const clean = parsed.ok ? parsed.value : {}
  const merged = { ...SETTINGS_DEFAULTS, ...clean }
  // An empty saved reply time falls back to the default text
  merged.replyTime = {
    it: clean.replyTime?.it || SETTINGS_DEFAULTS.replyTime.it,
    en: clean.replyTime?.en || SETTINGS_DEFAULTS.replyTime.en,
  }
  return merged
}

/** Digits of a phone number for tel: links. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

/** Links to the social pages that are filled in. */
export function socialLinks(s: Pick<SiteSettings, 'facebook' | 'instagram' | 'youtube'>) {
  return (['facebook', 'instagram', 'youtube'] as const)
    .map((platform) => ({ platform, url: s[platform] }))
    .filter((x) => x.url)
}
