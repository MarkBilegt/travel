'use client'

import Image from 'next/image'
import { ArrowUpRight, Facebook, Heart, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { SITE_CONFIG } from '@/lib/constants'
import { Link } from '@/navigation'
import { buttonStyles } from '@/components/ui/Button'
import { getTourField } from '@/lib/tour-locale'
import type { Tour } from '@/types'
import { useSettings } from '@/components/providers/SettingsProvider'
import { telHref as toTel, socialLinks as socialList } from '@/lib/site-settings'

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
} as const

const NAV_HREFS = [
  { href: '/', key: 'home' },
  { href: '/tours', key: 'tours' },
  { href: '/departures', key: 'departures' },
  { href: '/services', key: 'services' },
  { href: '/info', key: 'info' },
  { href: '/blog', key: 'blog' },
  { href: '/gallery', key: 'gallery' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const


interface FooterTour {
  title: string
  translations: Tour['translations']
  slug: string
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{children}</h3>
}

export function Footer({ tours = [] }: { tours?: FooterTour[] }) {
  const settings = useSettings()
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-blue/30 blur-3xl" />

      {/* Closing statement */}
      <div className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8 md:pt-24">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-14 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-3xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">{t('ctaTitle')}</h2>
          <Link href="/contact" className={buttonStyles({ variant: 'gold', size: 'xl', className: 'self-start md:self-auto' })}>
            {t('ctaButton')}
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="mb-6 inline-block" aria-label={SITE_CONFIG.name}>
              <Image src="/brand/logo-white.svg" alt={SITE_CONFIG.name} width={400} height={80} className="h-10 w-auto object-contain" />
            </Link>
            <p className="mb-7 max-w-xs text-sm leading-relaxed text-white/60">{t('description')}</p>
            <div className="flex gap-2">
              {socialList(settings).map(({ platform, url }) => {
                const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS]
                if (!Icon) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <ColumnTitle>{t('links')}</ColumnTitle>
            <ul className="space-y-3">
              {NAV_HREFS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <ColumnTitle>{t('destinations')}</ColumnTitle>
            <ul className="space-y-3">
              {tours.map((tour) => (
                <li key={tour.slug}>
                  <Link href={`/tours/${tour.slug}`} className="text-sm text-white/70 transition-colors hover:text-white">
                    {getTourField(tour, 'title', locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <ColumnTitle>{t('contact')}</ColumnTitle>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={toTel(settings.phone)} className="flex items-start gap-3 text-white/70 transition-colors hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all text-white/70 transition-colors hover:text-white">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                {settings.address}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs sm:flex-row sm:px-8">
          <div className="text-center sm:text-left">
            <p className="text-white/45">
              © {year} {SITE_CONFIG.legalName}. {t('rights')}
            </p>
            {settings.legalLine && <p className="mt-1 text-white/35">{settings.legalLine}</p>}
            <p className="mt-2 flex justify-center gap-4 sm:justify-start">
              <Link href="/privacy" className="text-white/60 transition-colors hover:text-white">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="text-white/60 transition-colors hover:text-white">
                {t('terms')}
              </Link>
            </p>
          </div>
          <a
            href="https://monweb.mn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-white/60 transition-colors hover:text-white"
          >
            {t('madeBy')} <Heart className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" /> Monweb.mn
          </a>
        </div>
      </div>
    </footer>
  )
}
