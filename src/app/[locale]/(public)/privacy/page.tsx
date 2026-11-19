import { pick, toLocale } from '@/i18n/locales'
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal/LegalDocument'
import { legalDocs } from '@/data/legal'
import { getSiteSettings } from '@/lib/cms-data'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: legalDocs(await getSiteSettings()).PRIVACY[toLocale(locale)].title }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  return <LegalDocument doc={legalDocs(await getSiteSettings()).PRIVACY[toLocale(locale)]} eyebrow={pick(locale, { it: 'Note legali', en: 'Legal' })} />
}
