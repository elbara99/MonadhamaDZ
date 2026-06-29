import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const cardVariants = {
  default:
    'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800',
  interactive:
    'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 cursor-pointer',
  highlight:
    'bg-gradient-to-br from-primary-50 to-surface-50 dark:from-primary-950/30 dark:to-surface-900 border border-primary-200 dark:border-primary-900/50',
} as const

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: keyof typeof cardVariants
}

function Card({
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  const MotionDiv = variant === 'interactive' ? motion.div : 'div'

  const motionProps =
    variant === 'interactive'
      ? {
          whileHover: { y: -2 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        }
      : {}

  return (
    <MotionDiv
      className={cn(
        'rounded-xl shadow-card transition-shadow duration-200',
        cardVariants[variant],
        variant === 'interactive' && 'hover:shadow-card-hover',
        className,
      )}
      {...motionProps}
      {...(props as any)}
    >
      {children}
    </MotionDiv>
  )
}

interface CardHeaderProps {
  className?: string
  children?: React.ReactNode
}

function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-surface-200 px-6 py-4 dark:border-surface-800',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface CardContentProps {
  className?: string
  children?: React.ReactNode
}

function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

interface CardFooterProps {
  className?: string
  children?: React.ReactNode
}

function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-surface-200 px-6 py-4 dark:border-surface-800',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }
