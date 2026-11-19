import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { Calendar, Users, Mountain, Check, ChevronRight, MapPin, BedDouble, Car, Sun, Route } from 'lucide-react'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'
import { cn } from '@/lib/utils'
import { getTourField, getTourArray } from '@/lib/tour-locale'
import type { Tour } from '@/types'

interface TourInfoProps {
  tour: Tour
}

export async function TourInfo({ tour }: TourInfoProps) {
  const t = await getTranslations('tours')
  const locale = await getLocale()
  const title = getTourField(tour, 'title', locale)
  const regionLabels = t.raw('regionLabels') as Record<string, string>
  const region = tour.region ? regionLabels[tour.region] ?? tour.region : ''
  const difficulty = tour.difficulty ? t(`difficulty.${tour.difficulty}` as Parameters<typeof t>[0]) : null

  const monthName = (m: number) => new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { month: 'long' }).format(new Date(2000, m - 1, 1))
  const months = [...tour.seasonMonths].sort((a, b) => a - b)
  const contiguous = months.length > 1 && months.every((m, i) => i === 0 || m === months[i - 1] + 1)
  const season = months.length === 0
    ? t('allYear')
    : contiguous
      ? `${monthName(months[0])} – ${monthName(months[months.length - 1])}`
      : months.map(monthName).join(', ')

  const facts = [
    { icon: Calendar, label: t('durationLabel'), value: t('days', { count: tour.duration }) },
    { icon: Users, label: t('groupLabel'), value: `${tour.groupSize.min}–${tour.groupSize.max} ${t('people')}` },
    ...(region ? [{ icon: MapPin, label: t('regionLabel'), value: region }] : []),
    ...(difficulty ? [{ icon: Mountain, label: t('difficultyLabel'), value: difficulty }] : []),
    { icon: Sun, label: t('seasonFact'), value: season },
    ...(tour.tourType ? [{ icon: Route, label: t('tourTypeFact'), value: t(`typeLabels.${tour.tourType}` as Parameters<typeof t>[0]) }] : []),
    ...(tour.accommodation.length
      ? [{ icon: BedDouble, label: t('accommodationFact'), value: tour.accommodation.map((a) => t(`accommodationLabels.${a}` as Parameters<typeof t>[0])).join(', ') }]
      : []),
    ...(tour.vehicle ? [{ icon: Car, label: t('vehicleFact'), value: t(`vehicles.${tour.vehicle}` as Parameters<typeof t>[0]) }] : []),
  ]

  return (
    <div className="mb-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-medium text-brand-navy/50">
        <Link href="/" className="transition-colors hover:text-brand-navy">{t('breadcrumbHome')}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/tours" className="transition-colors hover:text-brand-navy">{t('breadcrumbTours')}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="max-w-[200px] truncate text-brand-navy" aria-current="page">{title}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {region && (
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold-deep">
            <MapPin className="h-3.5 w-3.5" />
            {region}
          </span>
        )}
        {difficulty && (
          <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', difficultyClass(tour.difficulty))}>
            {difficulty}
          </span>
        )}
        {tour.isNew && (
          <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-navy">
            {t('new')}
          </span>
        )}
      </div>

      <h1 className="mb-8 text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl lg:text-6xl">{title}</h1>

      <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-brand-line bg-brand-line sm:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
        {facts.map(({ icon: Icon, label, value }) => (
          // 4 facts fill the 2-column phone grid evenly
          <div key={label} className="bg-white p-4 sm:p-5">
            <Icon className="mb-3 h-5 w-5 text-brand-gold-deep" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-navy/50">{label}</dt>
            <dd className="mt-0.5 font-display text-lg font-semibold text-brand-navy">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="flex flex-wrap gap-2">
        {getTourArray(tour, 'includes', locale).slice(0, 5).map((item) => (
          <li
            key={item}
            className="flex items-center gap-1.5 rounded-full bg-brand-cream px-3.5 py-2 text-xs font-semibold text-brand-navy"
          >
            <Check className="h-3.5 w-3.5 text-brand-gold-deep" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function difficultyClass(d: string): string {
  if (d === 'easy') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (d === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-red-200 bg-red-50 text-red-800'
}
