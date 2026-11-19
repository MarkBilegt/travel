'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Plane, Globe, CreditCard, FileText, RefreshCw, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'

const EASE = [0.16, 1, 0.3, 1] as const
const WHY_ICONS = [Plane, Globe, CreditCard, FileText, RefreshCw, ShieldCheck]

export function ValuesSection() {
  const t = useTranslations('about')

  // TODO(client): replace with the client's real numbers.
  const stats = t.raw('valuesStats') as Array<{ value: number; suffix: string; label: string }>
  const missionValues = t.raw('missionValues') as Array<{ title: string; desc: string }>
  const whyFeatures = (t.raw('whyFeatures') as Array<{ title: string; desc: string }>).map((f, i) => ({
    icon: WHY_ICONS[i] ?? ShieldCheck,
    ...f,
  }))

  return (
    <>
      {/* Stats band */}
      <section className="border-y border-brand-line bg-brand-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              className={cn(
                'flex flex-col gap-2 px-5 py-9 sm:px-8 lg:py-12',
                i % 2 === 1 && 'border-l border-brand-line',
                i >= 2 && 'border-t border-brand-line lg:border-t-0',
                i === 2 && 'lg:border-l',
              )}
            >
              <span className="font-display text-5xl font-bold leading-none tabular-nums text-brand-navy sm:text-6xl">
                {s.value.toLocaleString('en-US')}
                {s.suffix}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/60">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & vision as an editorial statement, values as a numbered list */}
      <section className="relative overflow-hidden bg-brand-navy px-5 py-20 text-white sm:px-8 md:py-28">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-7"
          >
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              <span aria-hidden className="h-px w-8 bg-brand-gold" />
              {t('valuesLabel')}
            </p>
            <h2 className="text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
              {t('valuesTitle1')} {t('valuesTitle2')}{' '}
              <span className="font-accent text-[1.08em] font-medium normal-case italic text-brand-gold">
                {t('valuesTitle3')}
              </span>
            </h2>
            <p className="mt-8 max-w-2xl font-accent text-2xl italic leading-snug text-white/85 sm:text-3xl">
              “{t('valuesMission')}”
            </p>
            <div className="mt-10 max-w-xl border-l-2 border-brand-gold pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">{t('valuesVisionLabel')}</p>
              <p className="mt-2 leading-relaxed text-white/70">{t('valuesVision')}</p>
            </div>
          </motion.div>

          <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-5 lg:self-end">
            {missionValues.map((v, i) => (
              <motion.li
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="grid grid-cols-[3rem_1fr] gap-4 py-6"
              >
                <span className="font-display text-2xl font-semibold text-brand-gold">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold uppercase">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{v.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t('whyLabel')} title={t('whyTitle')} />
          <div className="grid gap-px overflow-hidden rounded-3xl border border-brand-line bg-brand-line sm:grid-cols-2 lg:grid-cols-3">
            {whyFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                className="group bg-white p-7 transition-colors duration-300 hover:bg-brand-cream sm:p-9"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition-colors duration-300 group-hover:border-brand-gold group-hover:bg-brand-gold">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold uppercase text-brand-navy">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/65">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
