'use client'

// These boundaries render outside the locale layout that normally loads the
// stylesheet, so load it here or the page shows unstyled.
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOUNDARY_TEXT, boundaryLocaleFromPath } from '@/lib/boundary-text'

export default function NotFound() {
  const locale = boundaryLocaleFromPath(usePathname())
  const text = BOUNDARY_TEXT[locale]

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="max-w-md text-center">
        <p className="mb-4 font-display text-8xl font-bold text-brand-gold-deep">404</p>
        <h1 className="mb-3 text-3xl uppercase text-brand-navy">{text.notFoundTitle}</h1>
        <p className="mb-8 text-brand-navy/70">{text.notFoundBody}</p>
        <Link
          href={`/${locale}`}
          className="inline-flex h-12 items-center rounded-full bg-brand-navy px-8 font-semibold text-white transition-colors hover:bg-brand-ink-soft"
        >
          {text.backHome}
        </Link>
      </div>
    </div>
  )
}
