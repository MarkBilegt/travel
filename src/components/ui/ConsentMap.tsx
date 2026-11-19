'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'

interface ConsentMapProps {
  src: string
  title: string
  height: number
  className?: string
}

/**
 * Google Maps embed that loads only after a click: until then nothing is
 * requested from Google, so no cookies are set and no IP address is sent.
 */
export function ConsentMap({ src, title, height, className }: ConsentMapProps) {
  const t = useTranslations('embed')
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return <iframe title={title} src={src} width="100%" height={height} className={className ?? 'block border-0'} allowFullScreen loading="lazy" />
  }
  return (
    <div style={{ minHeight: height }} className="flex flex-col items-center justify-center gap-4 bg-brand-cream px-6 py-10 text-center">
      <MapPin className="h-8 w-8 text-brand-gold-deep" aria-hidden />
      <p className="max-w-md text-sm leading-relaxed text-brand-navy/70">
        {t('mapNote')}{' '}
        <Link href="/privacy" className="font-semibold underline">
          {t('privacy')}
        </Link>
      </p>
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-deep hover:text-white"
      >
        {t('showMap')}
      </button>
    </div>
  )
}
