'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'

/** Video embed that loads only after a click, so YouTube/Vimeo get no request (and set no cookies) before. */
export function ConsentVideo({ src }: { src: string }) {
  const t = useTranslations('embed')
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <div className="my-8 aspect-video overflow-hidden rounded-2xl">
        <iframe src={src} title="Video" className="h-full w-full border-0" allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
      </div>
    )
  }
  return (
    <div className="my-8 flex aspect-video flex-col items-center justify-center gap-4 rounded-2xl bg-brand-cream px-6 text-center">
      <p className="max-w-md text-sm leading-relaxed text-brand-navy/70">
        {t('videoNote')}{' '}
        <Link href="/privacy" className="font-semibold underline">
          {t('privacy')}
        </Link>
      </p>
      <button type="button" onClick={() => setLoaded(true)} className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-deep hover:text-white">
        <Play className="h-4 w-4" aria-hidden />
        {t('showVideo')}
      </button>
    </div>
  )
}
