'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PassengerCounterProps {
  label: string
  sublabel: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function PassengerCounter({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 20,
}: PassengerCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-brand-navy">{label}</p>
        <p className="text-xs text-gray-400">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors',
            value <= min
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white',
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center font-black text-brand-navy text-lg">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors',
            value >= max
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white',
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
