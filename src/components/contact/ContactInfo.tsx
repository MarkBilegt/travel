'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSettings } from '@/components/providers/SettingsProvider'
import { telHref } from '@/lib/site-settings'

const INFO_ICONS = [Phone, Mail, MapPin, Clock]

export function ContactInfo() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const settings = useSettings()
  const texts = t.raw('infoCards') as Array<{
    label: string
    primary: string
    secondary: string
    href: string | null
  }>
  // Labels and notes come from the editable texts; the values come from the contact settings
  const cards = texts.map((card, i) => {
    if (i === 0) {
      const numbers = [settings.phone, settings.phone2].filter(Boolean)
      const extra = [card.secondary, settings.skype ? `Skype: ${settings.skype}` : ''].filter(Boolean).join(' · ')
      return { ...card, primary: numbers.join(' · '), secondary: extra, href: telHref(settings.phone) }
    }
    if (i === 1) return { ...card, primary: settings.email, href: `mailto:${settings.email}` }
    if (i === 2) return { ...card, primary: settings.address, secondary: settings.addressNote || card.secondary }
    if (i === 3) return { ...card, primary: settings.replyTime[locale === 'en' ? 'en' : 'it'] }
    return card
  })

  return (
    <div>
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
        <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
        {t('infoLabel')}
      </p>
      <h2 className="mb-8 text-3xl uppercase leading-none text-brand-navy sm:text-4xl">{t('infoTitle')}</h2>

      <ul className="divide-y divide-brand-line border-y border-brand-line">
        {cards.map((card, i) => {
          const Icon = INFO_ICONS[i] ?? Phone
          const body = (
            <>
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-gold-deep transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-navy/50">{card.label}</span>
                <span className="mt-0.5 block break-words font-semibold text-brand-navy">{card.primary}</span>
                <span className="mt-0.5 block text-sm text-brand-navy/60">{card.secondary}</span>
              </span>
              {card.href && (
                <ArrowUpRight className="h-5 w-5 flex-shrink-0 self-center text-brand-navy/30 transition-colors group-hover:text-brand-gold-deep" />
              )}
            </>
          )
          return (
            <motion.li
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              {card.href ? (
                <a href={card.href} className="group flex gap-4 py-5">
                  {body}
                </a>
              ) : (
                <div className="group flex gap-4 py-5">{body}</div>
              )}
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
