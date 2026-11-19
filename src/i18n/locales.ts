/**
 * Single source of truth for the public site languages. Pure (no next-intl,
 * no React) so server code, e-mails and tests can all import it.
 * To add a language: add it here, add messages/<code>.json, an e-mail copy
 * block (src/emails/copy.ts) and a boundary-text block (src/lib/boundary-text.ts).
 */
export const LOCALES = ['it', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'it'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Anything that is not a supported language falls back to the default. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

/** Open Graph locale codes. */
export const OG_LOCALE: Record<Locale, string> = { it: 'it_IT', en: 'en_US' }

/** BCP 47 tags for Intl (dates, numbers). */
export const INTL_LOCALE: Record<Locale, string> = { it: 'it-IT', en: 'en-GB' }

/** Name of each language in its own language (for pickers). */
export const LOCALE_NAMES: Record<Locale, { label: string; short: string }> = {
  it: { label: 'Italiano', short: 'IT' },
  en: { label: 'English', short: 'EN' },
}

/**
 * Canonical + hreflang alternates for a path such as '/tours' ('' for home).
 * `x-default` points at the default language.
 */
export function localeAlternates(siteUrl: string, locale: string, path = '') {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `${siteUrl}/${l}${path}`
  languages['x-default'] = `${siteUrl}/${DEFAULT_LOCALE}${path}`
  return { canonical: `${siteUrl}/${toLocale(locale)}${path}`, languages }
}

/** Picks the text for a language. Requires every language, so adding one is a compile error until translated. */
export function pick<T>(locale: string, text: Record<Locale, T>): T {
  return text[toLocale(locale)]
}
