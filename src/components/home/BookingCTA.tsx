'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { buttonStyles } from '@/components/ui/Button'
import { useSettings } from '@/components/providers/SettingsProvider'
import { telHref as toTel } from '@/lib/site-settings'

// TODO(client): replace with a signature photo of the client's trips.
const BG = 'https://images.unsplash.com/photo-1575415868394-e3b78f3e9b3f?w=2000&q=80&auto=format&fit=crop'

export function BookingCTA() {
  const settings = useSettings()
  const t = useTranslations('bookingCTA')

  return (
    <section className="bg-white px-3 pb-3 sm:px-4 sm:pb-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-brand-navy"
      >
        <Image src={BG} alt="" fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-navy/10" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 md:py-28 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              <span aria-hidden className="h-px w-8 bg-brand-gold" />
              {t('label')}
            </p>
            <h2 className="text-5xl uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">{t('title')}</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">{t('description')}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/tours" className={buttonStyles({ variant: 'gold', size: 'xl' })}>
                {t('viewTours')}
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className={buttonStyles({ variant: 'glass', size: 'xl' })}>
                {t('bookNow')}
              </Link>
            </div>
          </div>

          {/* Direct lines: many customers prefer to call or message first */}
          <div className="space-y-3 lg:col-span-4 lg:col-start-9">
            <a
              href={toTel(settings.phone)}
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{t('call')}</span>
                <span className="block font-display text-xl font-semibold tracking-wide text-white">{settings.phone}</span>
              </span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-navy">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-white">{t('messenger')}</span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
