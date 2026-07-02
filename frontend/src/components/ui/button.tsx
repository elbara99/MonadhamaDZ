import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-algeria-600 text-white hover:bg-algeria-500 active:bg-algeria-700 shadow-sm shadow-algeria-500/20',
  gold:
    'bg-gold-500 text-white hover:bg-gold-400 active:bg-gold-600 shadow-sm shadow-gold-500/20',
  secondary:
    'bg-surface-100 text-surface-800 hover:bg-surface-200 active:bg-surface-300 dark:bg-navy-800 dark:text-surface-200 dark:hover:bg-navy-700',
  ghost:
    'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-navy-800 dark:hover:text-surface-100',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm',
  outline:
    'border border-surface-300 bg-transparent text-surface-700 hover:bg-surface-50 active:bg-surface-100 dark:border-navy-600 dark:text-surface-300 dark:hover:bg-navy-800',
}

const sizes = {
  sm: 'h-8 px-3 text-tiny gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-h3 gap-2.5',
}

const iconOnlySizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const loaderSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  iconOnly?: boolean
  loading?: boolean
  children?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      iconOnly = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center rounded-btn font-medium transition-all duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          iconOnly ? iconOnlySizes[size] : sizes[size],
          className,
        )}
        {...(props as any)}
      >
        {loading && (
          <Loader2
            className={cn('animate-spin', loaderSizes[size])}
            aria-hidden="true"
          />
        )}
        {loading ? (
          <span className={cn(children ? 'opacity-0' : '')}>{children}</span>
        ) : (
          children
        )}
      </motion.button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
