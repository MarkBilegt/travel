'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

// TODO(client): replace with the client's own trip photos.
const PHOTOS = [
  '1643449415644-ba803f1cd03d',
  '1711127016876-9a1b7e05126f',
  '1773658949441-76d4fb11412f',
  '1708873395735-dcad0140e3a2',
  '1773379410075-122d44982a07',
  '1773379418260-c34d07daf797',
  '1665031400827-b6c2ee549c04',
  '1630326867210-bf4b2cdd2019',
  '1575415868394-e3b78f3e9b3f',
  '1589654615616-6756a5653100',
].map((id) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`)

/** Slow, endless photo ribbon. Static and scrollable for reduced-motion users. */
export function ServicesPhotoStrip() {
  const reduceMotion = useReducedMotion()
  const row = reduceMotion ? PHOTOS : [...PHOTOS, ...PHOTOS]

  return (
    <section aria-hidden className="overflow-hidden bg-white py-6">
      <motion.div
        className="flex w-max gap-3"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={reduceMotion ? undefined : { duration: 60, ease: 'linear', repeat: Infinity }}
      >
        {row.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={i % 2 === 0 ? 'relative h-64 w-48 flex-shrink-0 overflow-hidden rounded-2xl sm:h-80 sm:w-60' : 'relative h-64 w-72 flex-shrink-0 overflow-hidden rounded-2xl sm:h-80 sm:w-96'}
          >
            <Image src={src} alt="" fill sizes="384px" className="object-cover" />
          </div>
        ))}
      </motion.div>
    </section>
  )
}
