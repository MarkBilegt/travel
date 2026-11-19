'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Award } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { SectionHeading } from '@/components/ui/SectionHeading'

// TODO(client): replace with the client's own team / trip photos.
const PHOTO_MAIN = 'https://images.unsplash.com/photo-1785042379212-af7cb35739d9?w=1200&q=80&auto=format&fit=crop'
const PHOTO_INSET = 'https://images.unsplash.com/photo-1535219241072-7d3c28a49a5c?w=800&q=80&auto=format&fit=crop'

export function WhyChooseUs() {
  const t = useTranslations('whyUs')
  const features = t.raw('features') as Array<{ title: string; description: string }>

  return (
    <section className="overflow-hidden bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Photo collage */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative aspect-[4/5] w-[85%] overflow-hidden rounded-[2rem]">
            <Image src={PHOTO_MAIN} alt="" fill sizes="(max-width: 1024px) 85vw, 40vw" className="object-cover" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-6 right-0 aspect-square w-[48%] overflow-hidden rounded-[1.5rem] border-[6px] border-white shadow-2xl shadow-brand-navy/15"
          >
            <Image src={PHOTO_INSET} alt="" fill sizes="(max-width: 1024px) 45vw, 20vw" className="object-cover" />
          </motion.div>
          {features[0] && (
            <div className="absolute left-5 top-5 flex max-w-[70%] items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                <Award className="h-5 w-5" />
              </span>
              <p className="font-display text-base font-semibold uppercase leading-tight text-brand-navy">{features[0].title}</p>
            </div>
          )}
        </motion.div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow={t('label')} title={t('title')} description={t('description')} className="!mb-10" />

          <ol className="divide-y divide-brand-line border-y border-brand-line">
            {features.map((feature, i) => (
              <motion.li
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-[3rem_1fr] gap-4 py-6"
              >
                <span className="font-display text-2xl font-semibold text-brand-gold-deep">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold uppercase text-brand-navy">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-navy/65">{feature.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-gold-deep"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
