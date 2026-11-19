'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Bus, Check, Compass, FileText, Globe, Home, Mountain, ShieldCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionHeading } from '@/components/ui/SectionHeading'

const EASE = [0.16, 1, 0.3, 1] as const
const MAIN_ICONS = [Globe, Mountain, Users]
// TODO(client): photos that match each main service.
const MAIN_PHOTOS = ['1785042379212-af7cb35739d9', '1535219241072-7d3c28a49a5c', '1643449415644-ba803f1cd03d'].map(
  (id) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`,
)
const OTHER_ICONS = [Bus, Home, Users, FileText, Compass, ShieldCheck]

export function ServicesSection() {
  const t = useTranslations('services')

  const main = (t.raw('main') as Array<{ category: string; subtitle: string; items: string[] }>).map((s, i) => ({
    ...s,
    icon: MAIN_ICONS[i] ?? Globe,
    photo: MAIN_PHOTOS[i] ?? MAIN_PHOTOS[0],
  }))
  const others = (t.raw('others') as Array<{ title: string; desc: string }>).map((s, i) => ({
    ...s,
    icon: OTHER_ICONS[i] ?? ShieldCheck,
  }))

  return (
    <>
      {/* Main services */}
      <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t('mainLabel')} title={`${t('mainTitle1')} ${t('mainTitle2')}`} />

          <div className="grid gap-6 md:grid-cols-3">
            {main.map((s, i) => (
              <motion.article
                key={s.category}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-brand-line bg-brand-cream"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={s.photo}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-brand-navy/10 to-transparent" />
                  <span className="absolute left-5 top-5 font-display text-5xl font-bold text-white/90">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute bottom-5 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl font-semibold uppercase leading-tight text-brand-navy">{s.category}</h3>
                  <p className="mt-1 text-sm text-brand-navy/60">{s.subtitle}</p>
                  <ul className="mt-6 space-y-3 border-t border-brand-line pt-6">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm leading-relaxed text-brand-navy/80">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold-deep" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Additional services */}
      <section className="bg-brand-cream px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t('otherLabel')} title={t('otherTitle')} />
          <div className="grid gap-px overflow-hidden rounded-3xl border border-brand-line bg-brand-line sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                className="group bg-white p-7 transition-colors duration-300 hover:bg-brand-sand/40 sm:p-9"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition-colors duration-300 group-hover:border-brand-gold group-hover:bg-brand-gold">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold uppercase text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/65">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
