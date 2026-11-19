'use client'

import { LOCALES, LOCALE_NAMES } from '@/i18n/locales'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ChevronDown, ArrowUpRight, MapPin } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { SITE_CONFIG } from '@/lib/constants'
import { buttonStyles } from '@/components/ui/Button'
import { Link, useRouter, usePathname } from '@/navigation'
import { ToursDropdown } from './ToursDropdown'
import { useSettings } from '@/components/providers/SettingsProvider'
import { telHref as toTel } from '@/lib/site-settings'

const NAV_HREFS = [
  { href: '/', key: 'home' },
  { href: '/tours', key: 'tours' },
  { href: '/departures', key: 'departures' },
  { href: '/services', key: 'services' },
  { href: '/info', key: 'info' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const

// Text codes instead of flag emoji: Windows renders flag emoji as plain letters.
const LOCALE_OPTIONS = LOCALES.map((code) => ({ code, ...LOCALE_NAMES[code] }))


function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const current = LOCALE_OPTIONS.find((l) => l.code === locale) ?? LOCALE_OPTIONS[0]

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code })
    setOpen(false)
    try {
      localStorage.setItem('preferred-locale', code)
    } catch {
      // storage unavailable - ignore
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-semibold tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Switch language"
        aria-expanded={open}
      >
        {current.short}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 min-w-[150px] overflow-hidden rounded-2xl border border-white/10 bg-brand-navy/95 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              {LOCALE_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    l.code === locale ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span className="w-6 text-[11px] font-bold tracking-wider text-brand-gold">{l.short}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface NavbarProps {
  regions?: string[]
}

export function Navbar({ regions = [] }: NavbarProps) {
  const settings = useSettings()
  const t = useTranslations('nav')
  const toursT = useTranslations('tours')
  const regionLabels = toursT.raw('regionLabels') as Record<string, string>
  const pathname = usePathname()
  const isTourDetail = pathname.includes('/tours/') && pathname.split('/tours/')[1]?.length > 0
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileToursOpen, setMobileToursOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const solid = scrolled || isTourDetail

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4"
      >
        {/* Soft top shade so the transparent bar stays legible over bright photos */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-navy/50 to-transparent transition-opacity duration-300',
            solid ? 'opacity-0' : 'opacity-100',
          )}
        />
        <nav
          className={cn(
            'relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full pl-5 pr-2 transition-all duration-300 sm:pl-6',
            solid
              ? 'bg-brand-navy/85 shadow-xl shadow-brand-navy/20 ring-1 ring-white/10 backdrop-blur-xl'
              : 'bg-transparent',
          )}
        >
          <Link href="/" className="flex-shrink-0" aria-label={SITE_CONFIG.name}>
            <Image
              src="/brand/logo-white.svg"
              alt={SITE_CONFIG.name}
              width={400}
              height={80}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav (xl+: six Mongolian labels need the room) */}
          <div className="hidden items-center gap-7 xl:flex">
            {NAV_HREFS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <div key={link.href} className="relative flex flex-col items-center">
                  {link.key === 'tours' ? (
                    <ToursDropdown label={t(link.key)} regions={regions} />
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'whitespace-nowrap text-sm font-medium transition-colors',
                        active ? 'text-white' : 'text-white/75 hover:text-white',
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  )}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-2.5 h-1 w-1 rounded-full bg-brand-gold"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={toTel(settings.phone)}
              aria-label={settings.phone}
              title={settings.phone}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:flex"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden text-xs font-semibold tracking-wide 2xl:inline">{settings.phone}</span>
            </a>

            <LanguageSwitcher />

            <Link
              href="/contact"
              className={buttonStyles({ variant: 'gold', size: 'sm', className: 'hidden h-11 px-5 sm:inline-flex' })}
            >
              {t('bookNow')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 xl:hidden"
              aria-label={t('openMenu')}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand-navy"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl"
            />

            <div className="relative flex flex-shrink-0 items-center justify-between px-6 py-5">
              <Image
                src="/brand/logo-white.svg"
                alt={SITE_CONFIG.name}
                width={400}
                height={80}
                className="h-8 w-auto object-contain"
              />
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={t('closeMenu')}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="relative flex flex-1 flex-col justify-center px-6">
              {NAV_HREFS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-white/10"
                >
                  {link.key === 'tours' && regions.length > 0 ? (
                    <div>
                      <button
                        onClick={() => setMobileToursOpen((prev) => !prev)}
                        className="flex w-full cursor-pointer items-baseline gap-4 py-4 text-left"
                        aria-expanded={mobileToursOpen}
                      >
                        <span className="w-6 text-xs font-semibold text-brand-gold">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-3xl font-bold uppercase text-white">{t(link.key)}</span>
                        <ChevronDown
                          className={cn('ml-auto h-6 w-6 self-center text-white/60 transition-transform', mobileToursOpen && 'rotate-180')}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileToursOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2 pb-4 pl-10">
                              {regions.map((region) => (
                                <Link
                                  key={region}
                                  href={`/tours?region=${encodeURIComponent(region)}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                  <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                                  {regionLabels[region] ?? region}
                                </Link>
                              ))}
                              <Link
                                href="/tours"
                                onClick={() => setMobileOpen(false)}
                                className="col-span-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-gold transition-colors hover:bg-white/5"
                              >
                                {t('allTours')} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-baseline gap-4 py-4"
                    >
                      <span className="w-6 text-xs font-semibold text-brand-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span
                        className={cn(
                          'font-display text-3xl font-bold uppercase transition-colors',
                          isActive(pathname, link.href) ? 'text-brand-gold' : 'text-white hover:text-brand-gold',
                        )}
                      >
                        {t(link.key)}
                      </span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="relative flex-shrink-0 space-y-4 px-6 pb-10 pt-8">
              <a href={toTel(settings.phone)} className="flex items-center gap-3 text-white/70 transition-colors hover:text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold tracking-wide">{settings.phone}</span>
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({ variant: 'gold', size: 'lg', fullWidth: true })}
              >
                {t('bookNow')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
