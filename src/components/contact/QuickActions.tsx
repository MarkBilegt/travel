'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Mail, Facebook, Instagram, MessageCircle, PhoneCall, Youtube } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSettings } from '@/components/providers/SettingsProvider'
import { socialLinks as socialList } from '@/lib/site-settings'

const actionMeta = (s: { whatsapp: string; viber: string; email: string }) => [
  { icon: MessageCircle, href: `https://wa.me/${s.whatsapp}`, external: true, dot: 'bg-[#25D366]' },
  { icon: MessageCircle, href: `viber://chat?number=%2B${s.viber}`, external: true, dot: 'bg-[#7360F2]' },
  { icon: Mail, href: `mailto:${s.email}`, external: false, dot: 'bg-brand-gold' },
  { icon: PhoneCall, href: '#contact-form', external: false, dot: 'bg-brand-blue' },
]

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, youtube: Youtube } as const

export function QuickActions() {
  const settings = useSettings()
  const ACTION_META = actionMeta(settings)
  const SOCIAL_LINKS = socialList(settings).map((x) => ({ label: x.platform, icon: SOCIAL_ICONS[x.platform], href: x.url }))
  const t = useTranslations('contact')
  const actions = (t.raw('quickActions') as Array<{ title: string; desc: string }>).map((a, i) => ({
    ...a,
    ...(ACTION_META[i] ?? ACTION_META[0]),
  }))

  return (
    <div>
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
        <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
        {t('quickLabel')}
      </p>
      <h2 className="mb-6 text-3xl uppercase leading-none text-brand-navy sm:text-4xl">{t('quickTitle')}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, i) => (
          <motion.a
            key={action.title}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-line bg-white p-4 transition-colors hover:border-brand-navy/30 hover:bg-brand-cream"
          >
            <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-navy">
              <action.icon className="h-[18px] w-[18px]" />
              <span aria-hidden className={`absolute right-0 top-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${action.dot}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-brand-navy">{action.title}</span>
              <span className="mt-0.5 block text-xs leading-snug text-brand-navy/60">{action.desc}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-brand-navy/30 transition-colors group-hover:text-brand-gold-deep" />
          </motion.a>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy/50">{t('socialTitle')}</p>
        <div className="flex gap-2">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-line text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-navy hover:text-white"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
