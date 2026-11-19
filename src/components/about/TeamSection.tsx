'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const TEAM_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=75&auto=format',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=75&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=75&auto=format',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=75&auto=format',
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function TeamSection() {
  const t = useTranslations('about')
  const team = (t.raw('team') as Array<{ name: string; role: string; bio: string }>).map(
    (m, i) => ({ ...m, image: TEAM_IMAGES[i] }),
  )

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-black uppercase tracking-widest text-brand-gold mb-3">
            {t('teamLabel')}
          </p>
          <h2 className="font-black uppercase tracking-tight text-brand-navy text-4xl md:text-5xl">
            {t('teamTitle')}
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {team.map((member) => (
            <motion.div
              key={member.name}
              variants={item}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-brand-blue/30 transition-all duration-300 text-center cursor-default"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-brand-gold/20 group-hover:border-brand-blue/40 transition-colors">
                <Image src={member.image} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="font-black text-brand-navy text-base">{member.name}</h3>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-wider mb-3">
                {member.role}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
