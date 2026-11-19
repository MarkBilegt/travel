/**
 * Copy for the app-level error and 404 pages. These render OUTSIDE the locale
 * layout (no next-intl provider), so they cannot use useTranslations: the
 * language is derived from the URL instead.
 */
import { LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n/locales.ts'

export type BoundaryLocale = Locale

export const BOUNDARY_TEXT = {
  it: {
    errorTitle: 'Qualcosa è andato storto',
    errorBody: 'Spiacenti, si è verificato un errore. Riprova.',
    help: 'Hai bisogno di aiuto?',
    retry: 'Riprova',
    notFoundTitle: 'Pagina non trovata',
    notFoundBody: 'La pagina che cerchi non esiste o è stata spostata.',
    backHome: 'Torna alla home',
  },
  en: {
    errorTitle: 'Something went wrong',
    errorBody: 'Sorry, something went wrong. Please try again.',
    help: 'Need help?',
    retry: 'Try again',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The page you are looking for does not exist or has moved.',
    backHome: 'Back to main page',
  },
} as const satisfies Record<BoundaryLocale, Record<string, string>>

/** "/en/tours/x" -> "en"; anything else falls back to the default language. */
export function boundaryLocaleFromPath(pathname: string | null | undefined): BoundaryLocale {
  const first = (pathname ?? '').split('/')[1]
  return (LOCALES as readonly string[]).includes(first) ? (first as BoundaryLocale) : DEFAULT_LOCALE
}
