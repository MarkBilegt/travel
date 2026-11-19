'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useSettings } from '@/components/providers/SettingsProvider'

// TODO(client): replace with the client's own trip photos.
const PHOTOS = [
  '1708873395735-dcad0140e3a2',
  '1773379410075-122d44982a07',
  '1773379418260-c34d07daf797',
  '1665031400827-b6c2ee549c04',
  '1630326867210-bf4b2cdd2019',
  '1575415868394-e3b78f3e9b3f',
  '1589654615616-6756a5653100',
].map((id) => `https://images.unsplash.com/photo-${id}?w=1200&q=75&auto=format&fit=crop`)

// 7 tiles that exactly fill a 4×3 grid on desktop (no orphan tile):
//   [0 0 1 2]
//   [0 0 3 2]
//   [4 5 5 6]
const SPANS = [
  'md:col-span-2 md:row-span-2',
  '',
  'md:row-span-2',
  '',
  '',
  'md:col-span-2',
  '',
]

export interface HomePhoto {
  url: string
  alt: string
}

/** The home page photo strip: photos from the library (featured first), topped up with stock photos until the library has 7. */
export function PhotoGallery({ photos = [] }: { photos?: HomePhoto[] }) {
  const t = useTranslations('gallery')
  const settings = useSettings()
  const alts = t.raw('images') as string[]
  const tiles: HomePhoto[] = [...photos.slice(0, 7), ...PHOTOS.slice(photos.length).map((url, i) => ({ url, alt: alts[photos.length + i] ?? '' }))].slice(0, 7)

  return (
    <section className="bg-brand-cream px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t('label')}
          title={t('title')}
          description={t('description')}
          action={
            settings.instagram ? (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-navy/15 px-5 py-3 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-navy hover:text-white"
              >
                <Instagram className="h-4 w-4" />
                {t('follow')}
              </a>
            ) : undefined
          }
        />

        <div className="grid auto-rows-[170px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 md:gap-4">
          {tiles.map(({ url: src, alt }, i) => (
            <motion.figure
              key={src}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={cn('group relative overflow-hidden rounded-2xl bg-brand-sand', SPANS[i], i === 0 && 'col-span-2 row-span-2')}
            >
              <Image
                src={src}
                alt={alt || SITE_CONFIG.name}
                fill
                sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              {alt && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-brand-navy/80 to-transparent p-4 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {alt}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/gallery" className="inline-flex items-center gap-2 rounded-full border border-brand-navy/15 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-navy hover:text-white">
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
