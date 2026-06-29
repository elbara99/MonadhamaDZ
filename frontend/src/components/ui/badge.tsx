import { cn } from '@/lib/utils'

const badgeVariants = {
  default:
    'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  primary:
    'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning:
    'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  danger:
    'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
} as const

const dotVariants = {
  default: 'bg-surface-400',
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-sky-500',
} as const

const sizes = {
  sm: 'px-2 py-0.5 text-2xs gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
} as const

const dotSizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
} as const

interface BadgeProps {
  variant?: keyof typeof badgeVariants
  size?: keyof typeof sizes
  dot?: boolean
  className?: string
  children?: React.ReactNode
}

function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-none',
        badgeVariants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('rounded-full', dotVariants[variant], dotSizes[size])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export { Badge, type BadgeProps }
