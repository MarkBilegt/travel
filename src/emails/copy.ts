/**
 * Language types shared by the e-mail templates. The wording itself lives next
 * to each template (see inquiry-copy.ts), as plain TypeScript rather than in
 * messages/*.json so it is not shipped to every visitor's browser.
 */

import type { Locale } from '@/i18n/locales'

/** Traveller e-mails follow the site languages. */
export type EmailLocale = Locale
/** Layout language: travellers' language, or Mongolian for the (team-facing) owner alerts. */
export type ShellLocale = EmailLocale | 'mn'
