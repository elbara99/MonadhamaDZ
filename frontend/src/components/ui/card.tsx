import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const cardVariants = {
  default:
    'bg-white dark:bg-navy-900 border border-surface-200/70 dark:border-navy-800/70 shadow-soft',
  interactive:
    'bg-white dark:bg-navy-900 border border-surface-200/70 dark:border-navy-800/70 shadow-soft cursor-pointer',
  highlight:
    'bg-gradient-to-br from-algeria-50/60 to-surface-50 dark:from-algeria-950/20 dark:to-navy-900 border border-algeria-200/50 dark:border-algeria-900/30',
  kpi:
    'bg-gradient-to-br from-gold-50/60 to-white dark:from-gold-950/20 dark:to-navy-900 border border-gold-200/50 dark:border-gold-900/30',
}

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
          whileHover: { y: -3 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        }
      : {}

  return (
    <MotionDiv
      className={cn(
        'rounded-card transition-all duration-150',
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
        'border-b border-surface-100 dark:border-navy-800/50 px-5 py-4',
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
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

interface CardFooterProps {
  className?: string
  children?: React.ReactNode
}

function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-surface-100 dark:border-navy-800/50 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }
