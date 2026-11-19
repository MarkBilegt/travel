'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1589654615616-6756a5653100?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1785042379212-af7cb35739d9?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1535219241072-7d3c28a49a5c?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1643449415644-ba803f1cd03d?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1711127016876-9a1b7e05126f?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1773658949441-76d4fb11412f?w=800&q=75&auto=format',
]

export function DestinationCategories() {
  const t = useTranslations('destinations')
  const items = t.raw('items') as string[]

  return (
    <section className="bg-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
            {t('label')}
          </p>
          <h2 className="font-black text-4xl md:text-5xl text-brand-navy uppercase tracking-tight">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((destination, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-xl aspect-square md:aspect-[4/3] cursor-pointer"
            >
              <Image
                src={DESTINATION_IMAGES[i] ?? DESTINATION_IMAGES[0]}
                alt={destination}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-brand-navy/50" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <h3 className="font-black text-white text-lg md:text-xl uppercase tracking-tight text-center leading-tight">
                  {destination}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
