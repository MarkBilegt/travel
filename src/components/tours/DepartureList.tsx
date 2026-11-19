import { useLocale, useTranslations } from 'next-intl'
import { ArrowUpRight, CalendarDays, CheckCircle2, Users } from 'lucide-react'
import { Link } from '@/navigation'
import { cn, formatPrice } from '@/lib/utils'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'
import { getTourField } from '@/lib/tour-locale'
import { isJoinable, shownStatus, signupsNeeded, spotsLeft } from '@/lib/departures'
import { fromPrice } from '@/lib/tour-pricing'
import type { Departure, Tour } from '@/types'

const STATUS_STYLE = {
  open: 'bg-brand-blue/10 text-brand-blue',
  confirmed: 'bg-emerald-50 text-emerald-800',
  full: 'bg-amber-50 text-amber-800',
  cancelled: 'bg-red-50 text-red-800',
} as const

interface DepartureListProps {
  departures: Departure[]
  /** Tours the departures belong to (for titles and prices). */
  tours: Tour[]
  /** Show the tour name and a link on each row (the all-departures page). */
  showTour?: boolean
}

/** Upcoming group departures: dates, how many have joined, whether it is guaranteed. */
export function DepartureList({ departures, tours, showTour = false }: DepartureListProps) {
  const t = useTranslations('departures')
  const locale = useLocale()
  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { day: 'numeric', month: 'short', year: 'numeric' })
  const tourById = new Map(tours.map((x) => [x.id, x]))

  return (
    <ul className="divide-y divide-brand-line overflow-hidden rounded-3xl border border-brand-line bg-white">
      {departures.map((d) => {
        const tour = tourById.get(d.tourId)
        const status = shownStatus(d)
        const joinable = isJoinable(d)
        const unit = d.price ?? (tour ? fromPrice(tour) : null)
        const days = Math.round((Date.parse(d.endDate) - Date.parse(d.startDate)) / 86_400_000) + 1
        return (
          <li key={d.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              {showTour && tour && (
                <Link href={`/tours/${tour.slug}`} className="mb-1 block font-display text-xl font-semibold uppercase text-brand-navy transition-colors hover:text-brand-gold-deep">
                  {getTourField(tour, 'title', locale)}
                </Link>
              )}
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-brand-navy">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-brand-gold-deep" aria-hidden />
                  {fmt.format(new Date(d.startDate))} – {fmt.format(new Date(d.endDate))}
                </span>
                <span className="text-brand-navy/50">{t('days', { count: days })}</span>
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-navy/60">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {t('joined', { enrolled: d.enrolled, max: d.maxParticipants })}
                </span>
                {status === 'confirmed' && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {t('guaranteed')}
                  </span>
                )}
                {status === 'open' && <span>{t('needed', { count: signupsNeeded(d) })}</span>}
                {joinable && <span>{t('spotsLeft', { count: spotsLeft(d) })}</span>}
              </p>
              {d.notes && <p className="mt-1.5 text-xs text-brand-navy/60">{d.notes}</p>}
            </div>

            <div className="flex flex-shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
              <span className={cn('rounded-full px-3 py-1 text-xs font-bold', STATUS_STYLE[status])}>{t(`status.${status}`)}</span>
              {unit !== null && tour && (
                <span className="font-display text-lg font-semibold text-brand-navy">{t('fromPrice', { price: formatPrice(unit, tour.currency, locale) })}</span>
              )}
              {joinable && (
                <Link
                  href={`/contact?departure=${d.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-gold-deep hover:text-white"
                >
                  {t('requestSpot')}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
