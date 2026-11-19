'use client'

import { useTranslations } from 'next-intl'
import { PageHero } from '@/components/ui/PageHero'

// TODO(client): replace with a signature photo of the client's team or trips.
const HERO_IMAGE = 'https://images.unsplash.com/photo-1665031400827-b6c2ee549c04?w=2000&q=80&auto=format&fit=crop'

export function AboutHero() {
  const t = useTranslations('about')

  return (
    <PageHero
      size="lg"
      eyebrow={t('heroLabel')}
      title={[t('heroLine1'), t('heroLine2')]}
      accent={t('heroLine3')}
      description={t('heroDescription')}
      image={HERO_IMAGE}
    />
  )
}
