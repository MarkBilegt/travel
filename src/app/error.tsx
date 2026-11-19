'use client'

// These boundaries render outside the locale layout that normally loads the
// stylesheet, so load it here or the page shows unstyled.
import './globals.css'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/constants'
import { BOUNDARY_TEXT, boundaryLocaleFromPath } from '@/lib/boundary-text'

const telHref = `tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, '')}`

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const text = BOUNDARY_TEXT[boundaryLocaleFromPath(usePathname())]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="max-w-md text-center">
        <p className="mb-4 font-display text-6xl font-bold text-brand-gold-deep">!</p>
        <h1 className="mb-3 text-3xl uppercase text-brand-navy">{text.errorTitle}</h1>
        <p className="mb-8 text-brand-navy/70">{text.errorBody}</p>
        {/* Customers should reach the agency, not the developer */}
        <p className="mb-6 text-sm text-brand-navy/60">
          {text.help}{' '}
          <a href={telHref} className="font-semibold text-brand-navy underline-offset-4 hover:underline">
            {SITE_CONFIG.phone}
          </a>
        </p>
        <button
          onClick={reset}
          className="inline-flex h-12 cursor-pointer items-center rounded-full bg-brand-navy px-8 font-semibold text-white transition-colors hover:bg-brand-ink-soft"
        >
          {text.retry}
        </button>
      </div>
    </div>
  )
}
