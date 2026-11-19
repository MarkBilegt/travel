'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue text-white hover:bg-brand-navy focus-visible:ring-brand-blue',
  secondary: 'bg-brand-navy text-white hover:bg-brand-ink-soft focus-visible:ring-brand-navy',
  outline:
    'border border-brand-navy/20 text-brand-navy hover:border-brand-navy hover:bg-brand-navy hover:text-white focus-visible:ring-brand-navy',
  ghost: 'text-brand-navy hover:bg-brand-navy/5 focus-visible:ring-brand-navy',
  gold: 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light focus-visible:ring-brand-gold',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  glass:
    'border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-brand-navy focus-visible:ring-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-7 text-sm sm:text-base',
  xl: 'h-14 px-9 text-base',
}

/** Button look for links: <Link className={buttonStyles({ variant: 'gold' })}> */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold tracking-wide whitespace-nowrap',
    'transition-colors duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  )
}

const MotionButton = motion.create('button')

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <MotionButton
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold tracking-wide whitespace-nowrap',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="-ml-1 mr-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </MotionButton>
    )
  },
)

Button.displayName = 'Button'

export { Button }
