'use client'

import { motion } from 'framer-motion'
import { Coins, HandHeart, Home, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionHeading } from '@/components/ui/SectionHeading'

const EASE = [0.16, 1, 0.3, 1] as const
const ICONS = [Coins, Home, Store, HandHeart]

/** The cooperative's own commitments, from the "Chi siamo" page of the old site. */
export function ImpactSection() {
  const t = useTranslations('impact')
  const items = t.raw('items') as Array<{ title: string; desc: string }>

  return (
    <section className="relative overflow-hidden bg-brand-navy px-5 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand-gold/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading tone="dark" eyebrow={t('label')} title={t('title')} description={t('description')} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur"
              >
                <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold uppercase text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
