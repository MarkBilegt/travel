'use client'

import { LOCALES, LOCALE_NAMES } from '@/i18n/locales'
import { SITE_CONFIG } from '@/lib/constants'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from '@/navigation'

const OPTIONS = LOCALES.map((code) => ({ code, label: LOCALE_NAMES[code].label, code2: LOCALE_NAMES[code].short }))

const STORAGE_KEY = 'preferred-locale'

function setLocaleCookie(code: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
}

interface LanguagePickerProps {
  locale: string
}

export function LanguagePicker({ locale }: LanguagePickerProps) {
  const [visible, setVisible] = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY)
    } catch {
      return
    }
    if (saved) return

    // Only interrupt first-time visitors on the homepage. Deep links
    // (/en/tours/..., ads, shared links) already carry an explicit locale,
    // so remember it silently instead of blocking the page.
    if (pathname !== '/') {
      try {
        localStorage.setItem(STORAGE_KEY, locale)
      } catch {
        // storage unavailable (private mode) - ignore
      }
      return
    }

    // Small delay so the page content renders before overlay appears
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [pathname, locale])

  const handleSelect = (code: string) => {
    if (selecting) return
    setSelecting(code)
    localStorage.setItem(STORAGE_KEY, code)
    // Set cookie so the middleware redirects to correct locale on future visits
    setLocaleCookie(code)

    setTimeout(() => {
      if (code !== locale) {
        router.replace(pathname, { locale: code })
      } else {
        setVisible(false)
        setSelecting(null)
      }
    }, 250)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-brand-navy flex flex-col items-center justify-center px-6"
        >
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 40%, var(--color-brand-blue) 0%, transparent 70%)',
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="relative z-10 mb-14"
          >
            <Image
              src="/brand/logo-white.svg"
              alt={SITE_CONFIG.name}
              width={300}
              height={64}
              className="h-12 w-auto"
              priority
            />
          </motion.div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative z-10 text-white/40 text-xs uppercase tracking-[0.2em] mb-10 text-center"
          >
            Scegli la lingua · Choose your language
          </motion.p>

          {/* Cards */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-lg">
            {OPTIONS.map((l, i) => (
              <motion.button
                key={l.code}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.45, ease: 'easeOut' }}
                onClick={() => handleSelect(l.code)}
                disabled={!!selecting}
                className={cn(
                  'flex-1 relative overflow-hidden rounded-2xl border-2 px-8 py-10',
                  'flex flex-col items-center gap-4',
                  'transition-all duration-200 cursor-pointer',
                  selecting === l.code
                    ? 'border-brand-gold bg-brand-gold/10 scale-[0.97]'
                    : 'border-white/10 hover:border-brand-gold/50 hover:bg-white/5 active:scale-[0.97]',
                  selecting && selecting !== l.code && 'opacity-40',
                )}
              >
                <span className="flex h-14 w-14 select-none items-center justify-center rounded-full border border-brand-gold/40 font-display text-lg font-semibold tracking-wider text-brand-gold">{l.code2}</span>
                <div className="text-center">
                  <p className="text-white font-black text-2xl uppercase tracking-tight leading-none">
                    {l.label}
                  </p>
                </div>

                {/* Spinner on selecting */}
                <AnimatePresence>
                  {selecting === l.code && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-brand-navy/60 rounded-2xl"
                    >
                      <div className="w-7 h-7 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Subtle brand line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="relative z-10 mt-14 text-white/20 text-[11px] tracking-widest uppercase"
          >
            {SITE_CONFIG.domain}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
