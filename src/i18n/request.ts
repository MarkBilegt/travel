import { getRequestConfig } from 'next-intl/server'
import { toLocale } from './locales'
import { getTextOverrides } from '@/lib/cms-data'
import { applyTextOverrides } from '@/lib/site-texts'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = toLocale(await requestLocale)
  const base = (await import(`../../messages/${locale}.json`)).default
  // Texts edited in the admin panel replace the built-in ones (see lib/site-texts.ts)
  const overrides = await getTextOverrides(locale)
  return { locale, messages: applyTextOverrides(base, overrides) }
})
