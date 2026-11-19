import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  as?: React.ElementType
}

interface CardSectionProps {
  className?: string
  children: React.ReactNode
}

function Card({ className, children, hover = false, as: Component = 'div' }: CardProps) {
  return (
    <Component
      className={cn(
        'bg-white rounded-xl shadow-sm overflow-hidden',
        hover && 'transition-shadow duration-300 hover:shadow-lg',
        className,
      )}
    >
      {children}
    </Component>
  )
}

function CardHeader({ className, children }: CardSectionProps) {
  return <div className={cn('p-6 pb-4', className)}>{children}</div>
}

function CardBody({ className, children }: CardSectionProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

function CardFooter({ className, children }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-100', className)}>{children}</div>
  )
}

export { Card, CardHeader, CardBody, CardFooter }
export type { CardProps }
