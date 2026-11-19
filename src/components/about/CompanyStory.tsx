'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSettings } from '@/components/providers/SettingsProvider'

// TODO(client): replace with the client's own photo.
const STORY_IMAGE = 'https://images.unsplash.com/photo-1630326867210-bf4b2cdd2019?w=1200&q=80&auto=format&fit=crop'
const EASE = [0.16, 1, 0.3, 1] as const

export function CompanyStory() {
  const settings = useSettings()
  const t = useTranslations('about')
  const milestones = t.raw('milestones') as Array<{ year: string; label: string }>

  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Title + photo (sticky on desktop) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
                <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
                {t('storyLabel')}
              </p>
              <h2 className="text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl lg:text-6xl">
                {t('storyTitle1')}{' '}
                <span className="font-accent text-[1.08em] font-medium normal-case italic text-brand-gold-deep">
                  {t('storyTitle2')}
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="relative mt-10 aspect-[4/5] overflow-hidden rounded-[2rem]"
            >
              <Image src={STORY_IMAGE} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-brand-gold px-5 py-3 text-brand-navy">
                {/* TODO(client): real number of years */}
                <p className="font-display text-4xl font-bold leading-none">{settings.foundedYear}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em]">{t('experienceLabel')}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Story + timeline */}
        <div className="lg:col-span-6 lg:col-start-7">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="space-y-6"
          >
            <p className="font-accent text-2xl font-medium italic leading-snug text-brand-navy sm:text-3xl">{t('story1')}</p>
            <p className="text-base leading-relaxed text-brand-navy/70">{t('story2')}</p>
            <p className="text-base leading-relaxed text-brand-navy/70">{t('story3')}</p>
          </motion.div>

          <ol className="relative mt-14 border-l border-brand-line pl-8">
            {milestones.map((m, i) => (
              <motion.li
                key={`${m.year}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="relative pb-10 last:pb-0"
              >
                <span
                  aria-hidden
                  className="absolute -left-[2.35rem] top-2 h-3 w-3 rounded-full border-2 border-white bg-brand-gold ring-4 ring-brand-gold/20"
                />
                <p className="font-display text-4xl font-semibold leading-none text-brand-navy">{m.year}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-brand-navy/60">{m.label}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
