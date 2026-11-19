import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SITE_CONFIG } from './constants.ts'
import { INTL_LOCALE, toLocale } from '../i18n/locales.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns `path` only if it is a same-origin relative path ("/it/account").
 * Rejects absolute URLs, protocol-relative ("//evil.com"), backslash tricks
 * and userinfo tricks ("@evil.com"), falling back to `fallback`.
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path || typeof path !== 'string') return fallback
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback
  try {
    const base = 'http://localhost'
    const url = new URL(path, base)
    if (url.origin !== base) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export type Currency = 'EUR' | 'USD'
export const CURRENCIES: readonly Currency[] = ['EUR', 'USD']

/** Whole-unit price in the given currency, formatted for the visitor's language. */
export function formatPrice(
  amount: number,
  currency: Currency = SITE_CONFIG.currency as Currency,
  locale?: string,
): string {
  return new Intl.NumberFormat(INTL_LOCALE[toLocale(locale)], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date, locale?: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
