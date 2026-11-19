'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { PassengerCounter } from './PassengerCounter'
import { Link } from '@/navigation'
import { adultTripPrice, childTripPrice } from '@/lib/tour-pricing'
import type { Tour } from '@/types'

interface BookingCardProps {
  tour: Tour
}

const ctaClass =
  'flex items-center justify-center gap-2 rounded-full bg-brand-gold px-6 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-deep hover:text-white'

/**
 * Price summary and "request a quote" call to action. Nothing is paid online:
 * the estimate uses the same rules as the server (lib/tour-pricing) and the
 * button opens the quote form with this tour pre-selected.
 */
export function BookingCard({ tour }: BookingCardProps) {
  const t = useTranslations('bookingCard')
  const tt = useTranslations('tours')
  const locale = useLocale()
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const onRequest = tour.priceMode === 'on_request'
  const people = adults + children
  const adultPrice = adultTripPrice(tour, people) ?? 0
  const childPrice = childTripPrice(tour, people) ?? 0
  const totalPrice = adults * adultPrice + children * childPrice
  const quoteHref = `/contact?tour=${encodeURIComponent(tour.slug)}`
  const tierLabel = (tier: Tour['priceTiers'][number]) =>
    tier.maxPeople === undefined
      ? tt('tierOpen', { min: tier.minPeople })
      : tier.maxPeople === tier.minPeople
        ? tt('tierExact', { n: tier.minPeople })
        : tt('tierRange', { min: tier.minPeople, max: tier.maxPeople })

  return (
    <>
      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brand-line bg-white/95 px-4 py-3 shadow-[0_-12px_32px_-16px_rgba(14,26,34,0.25)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-navy/50">{onRequest ? tt('priceOnRequest') : t('estimateLabel')}</p>
          {!onRequest && <p className="font-display text-xl font-semibold leading-none text-brand-navy">{formatPrice(totalPrice, tour.currency, locale)}</p>}
        </div>
        <Link href={quoteHref} className={`${ctaClass} h-11 shrink-0`}>
          {tt('requestQuote')}
        </Link>
      </div>

      <div className="hidden overflow-hidden rounded-[2rem] border border-brand-line bg-white shadow-2xl shadow-brand-navy/10 lg:block">
        <div className="relative overflow-hidden bg-brand-navy p-6">
          <div aria-hidden className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/25 blur-2xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{tour.priceMode === 'from_per_day' ? tt('perPersonPerDay') : t('pricePerPerson')}</p>
          <p className="relative mt-1 font-display text-4xl font-bold leading-none text-white">
            {onRequest ? tt('priceOnRequest') : tour.priceMode === 'from_per_day' ? formatPrice(tour.price, tour.currency, locale) : formatPrice(adultPrice, tour.currency, locale)}
          </p>
        </div>

        <div className="space-y-6 p-6">
          {onRequest && <p className="text-sm leading-relaxed text-brand-navy/70">{tt('onRequestNote')}</p>}

          {!onRequest && tour.priceTiers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy/60">{tt('priceTiersTitle')}</p>
              <ul className="divide-y divide-brand-line rounded-2xl border border-brand-line text-sm">
                {tour.priceTiers.map((tier) => (
                  <li key={tier.minPeople} className="flex justify-between px-4 py-2.5 text-brand-navy">
                    <span>{tierLabel(tier)}</span>
                    <span className="font-semibold">{formatPrice(tour.priceMode === 'from_per_day' ? tier.price * tour.duration : tier.price, tour.currency, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!onRequest && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy/60">{t('passengers')}</p>
                <PassengerCounter label={t('adults')} sublabel={t('adultsAge')} value={adults} onChange={setAdults} min={1} max={tour.groupSize.max} />
                <PassengerCounter label={t('children')} sublabel={t('childrenAge')} value={children} onChange={setChildren} min={0} max={Math.max(0, tour.groupSize.max - adults)} />
              </div>

              <div className="space-y-2 rounded-2xl bg-brand-cream p-4">
                <div className="flex justify-between text-xs text-brand-navy/60">
                  <span>{adults} {t('adults')} × {formatPrice(adultPrice, tour.currency, locale)}</span>
                  <span>{formatPrice(adults * adultPrice, tour.currency, locale)}</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between text-xs text-brand-navy/60">
                    <span>{children} {t('children')} × {formatPrice(childPrice, tour.currency, locale)}</span>
                    <span>{formatPrice(children * childPrice, tour.currency, locale)}</span>
                  </div>
                )}
                <div className="h-px bg-brand-line" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-navy">{t('estimateLabel')}</span>
                  <span className="font-display text-2xl font-semibold text-brand-navy">{formatPrice(totalPrice, tour.currency, locale)}</span>
                </div>
                {tour.singleSupplement ? (
                  <p className="pt-1 text-xs text-brand-navy/60">{tt('singleSupplement')}: {formatPrice(tour.singleSupplement, tour.currency, locale)}</p>
                ) : null}
                <p className="pt-1 text-xs text-brand-navy/50">{t('estimateNote')}</p>
              </div>
            </>
          )}

          <Link href={quoteHref} className={`${ctaClass} h-12 w-full`}>
            {tt('requestQuote')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>

          <div className="flex items-start gap-3 border-t border-brand-line pt-5 text-xs leading-relaxed text-brand-navy/60">
            <Wallet className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold-deep" aria-hidden />
            <span>{t('noPayment')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-navy/60">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-brand-blue" aria-hidden />
            {t('trust')}
          </div>
        </div>
      </div>
    </>
  )
}
