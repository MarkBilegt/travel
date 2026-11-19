'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { PARTNERS, type PartnerEntry } from '@/lib/constants/partners'

// ─── Single logo card ─────────────────────────────────────────────────────────

function PartnerLogo({ partner }: { partner: PartnerEntry }) {
  const [imgError, setImgError] = useState(false)
  const showText = !partner.logo || imgError

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0"
      aria-label={partner.name}
    >
      <div className="relative flex items-center justify-center w-36 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm mx-3 transition-all duration-300 group-hover:shadow-lg group-hover:border-brand-gold/30 group-hover:scale-105">
        {showText ? (
          <span className="font-black text-sm uppercase tracking-tight text-brand-navy px-3 text-center leading-tight transition-transform duration-300 group-hover:scale-110">
            {partner.name}
          </span>
        ) : (
          <Image
            src={partner.logo!}
            alt={partner.name}
            width={100}
            height={48}
            className="object-contain max-h-12 w-auto transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
            unoptimized
          />
        )}
      </div>
    </a>
  )
}

// ─── Infinite scrolling row ───────────────────────────────────────────────────

function MarqueeRow({
  partners,
  direction = 'left',
  duration = 30,
}: {
  partners: PartnerEntry[]
  direction?: 'left' | 'right'
  duration?: number
}) {
  // Duplicate so the loop is seamless
  const items = [...partners, ...partners]
  const from = direction === 'left' ? '0%' : '-50%'
  const to   = direction === 'left' ? '-50%' : '0%'

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex w-max"
        animate={{ x: [from, to] }}
        transition={{
          x: { repeat: Infinity, repeatType: 'loop', duration, ease: 'linear' },
        }}
      >
        {items.map((partner, i) => (
          <PartnerLogo key={`${partner.name}-${i}`} partner={partner} />
        ))}
      </motion.div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Partners() {
  const t = useTranslations('partners')
  if (PARTNERS.length === 0) return null
  // Split into two groups for the two rows
  const mid = Math.ceil(PARTNERS.length / 2)
  const row1 = PARTNERS.slice(0, mid)
  const row2 = PARTNERS.slice(mid)

  return (
    <section suppressHydrationWarning className="relative bg-[#F8F6F1] py-20 overflow-hidden">

      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
      </div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-60px' }}
        className="text-center mb-12 px-4"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
          {t('label')}
        </p>
        <h2 className="font-black text-3xl md:text-4xl text-brand-navy uppercase tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
          {t('description')}
        </p>
      </motion.div>

      {/* Marquee rows */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative space-y-4"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none bg-gradient-to-r from-[#F8F6F1] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none bg-gradient-to-l from-[#F8F6F1] to-transparent" />

        <MarqueeRow partners={row1} direction="left"  duration={28} />
        <MarqueeRow partners={row2} direction="right" duration={32} />
      </motion.div>

      {/* Bottom badge count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span className="w-8 h-px bg-gray-300" />
          {t('count', { count: PARTNERS.length })}
          <span className="w-8 h-px bg-gray-300" />
        </span>
      </motion.div>
    </section>
  )
}
