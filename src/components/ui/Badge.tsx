import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'gold'
  | 'blue'
  | 'navy'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline'

export interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  gold: 'bg-brand-gold text-brand-navy',
  blue: 'bg-brand-blue text-white',
  navy: 'bg-brand-navy text-white',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  outline: 'border border-brand-gold text-brand-gold bg-transparent',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-semibold uppercase tracking-widest',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
