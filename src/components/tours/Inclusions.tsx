import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle } from 'lucide-react'

interface InclusionsProps {
  includes: string[]
  excludes: string[]
}

export function Inclusions({ includes, excludes }: InclusionsProps) {
  const t = useTranslations('tours')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Includes */}
      <div>
        <h3 className="font-black text-brand-navy text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {t('includedTitle')}
        </h3>
        <ul className="space-y-3">
          {includes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Excludes */}
      <div>
        <h3 className="font-black text-brand-navy text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          {t('excludedTitle')}
        </h3>
        <ul className="space-y-3">
          {excludes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
