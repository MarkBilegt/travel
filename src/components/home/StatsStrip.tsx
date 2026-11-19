'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, animate, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MONGOLIA_REGIONS } from '@/lib/constants'
import { useSettings } from '@/components/providers/SettingsProvider'

function CountUp({ value, suffix, animateValue }: { value: number; suffix: string; animateValue: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!animateValue || reduceMotion || !isInView || !ref.current) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v: number) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-US') + suffix
      },
    })
    return () => controls.stop()
  }, [animateValue, reduceMotion, isInView, value, suffix])

  // Render the final value on the server so the number is never shown as "0".
  // Years are printed raw ("2020", not "2,020").
  return (
    <span ref={ref} className="tabular-nums">
      {animateValue ? value.toLocaleString('en-US') : String(value)}
      {suffix}
    </span>
  )
}

export function StatsStrip() {
  const settings = useSettings()
  const t = useTranslations('stats')

  // TODO(client): confirm each figure with the cooperative.
  const STATS = [
    // A year should read as a year, not count up from zero.
    { value: settings.foundedYear, suffix: '', label: t('founded'), animate: false },
    { value: Object.keys(MONGOLIA_REGIONS).length, suffix: '', label: t('regions'), animate: true },
    // The old site quotes about 70-150 EUR per person per day depending on services.
    { value: 70, suffix: ' €', label: t('perDay'), animate: true },
    // The nine commitments listed in the cooperative's mission (see messages impact.items).
    { value: 9, suffix: '', label: t('commitments'), animate: true },
  ]

  return (
    <section className="relative border-b border-brand-line bg-brand-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'flex flex-col gap-2 px-5 py-9 sm:px-8 lg:py-12',
              i % 2 === 1 ? 'border-l border-brand-line' : '',
              i >= 2 ? 'border-t border-brand-line lg:border-t-0' : '',
              i === 2 ? 'lg:border-l' : '',
            ].join(' ')}
          >
            <span className="font-display text-5xl font-bold leading-none text-brand-navy sm:text-6xl">
              <CountUp value={stat.value} suffix={stat.suffix} animateValue={stat.animate} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/60">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
