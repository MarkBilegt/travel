import { formatPrice } from './utils.ts'
import { fromPrice } from './tour-pricing.ts'
import type { Tour } from '../types/index.ts'

type Translate = (key: 'priceOnRequest' | 'priceFrom', values?: { price: string }) => string

/**
 * Price text for cards and banners: "On request", "from 1,500 €" (when the
 * price depends on group size or is per day) or the plain price.
 */
export function tourPriceLabel(
  tour: Pick<Tour, 'price' | 'currency' | 'priceMode' | 'priceTiers' | 'duration'>,
  locale: string,
  t: Translate,
): string {
  const price = fromPrice(tour)
  if (price === null) return t('priceOnRequest')
  const text = formatPrice(price, tour.currency, locale)
  const isFrom = tour.priceTiers.length > 0 || tour.priceMode === 'from_per_day'
  return isFrom ? t('priceFrom', { price: text }) : text
}
