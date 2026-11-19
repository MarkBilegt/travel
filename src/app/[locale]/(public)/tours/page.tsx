import { localeAlternates } from '@/i18n/locales'
import { SITE_URL } from '@/lib/constants'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ToursPageContent } from '@/components/tours/ToursPageContent'
import { createSupabasePublic } from '@/lib/supabase/public'
import { withDemoTours } from '@/data/demo-tours'
import type { Tour } from '@/types'
import { mapTour, TOUR_CARD_COLUMNS } from '@/lib/tour-mapper'

interface Props {
  params: Promise<{ locale: string }>
}

export const revalidate = 300
export const dynamic = 'force-static'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('tours.title'),
    description: t('tours.description'),
    alternates: localeAlternates(SITE_URL, locale, '/tours'),
  }
}

function ToursLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-navy font-semibold text-sm uppercase tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  )
}

async function ToursContent() {
  const supabase = createSupabasePublic()
  const { data } = await supabase
    .from('tours')
    .select(TOUR_CARD_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const tours: Tour[] = withDemoTours((data ?? []).map(mapTour))
  return <ToursPageContent tours={tours} />
}

export default async function ToursPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={<ToursLoading />}>
      <ToursContent />
    </Suspense>
  )
}
