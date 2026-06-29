import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const

const statusSizes = {
  sm: 'h-2.5 w-2.5 ring-1',
  md: 'h-3 w-3 ring-2',
  lg: 'h-3.5 w-3.5 ring-2',
} as const

const dotColors = {
  online: 'bg-emerald-500',
  offline: 'bg-surface-400 dark:bg-surface-500',
  busy: 'bg-danger-500',
  away: 'bg-warning-500',
} as const

type StatusType = keyof typeof dotColors

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: keyof typeof sizeClasses
  status?: StatusType
  className?: string
}

function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const initials = name ? getInitials(name) : null

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size],
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
            sizeClasses[size],
          )}
          aria-label={name || alt}
        >
          {initials || '?'}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white dark:border-surface-900',
            dotColors[status],
            statusSizes[size],
          )}
          aria-label={status}
        />
      )}
    </div>
  )
}

export { Avatar, type AvatarProps, type StatusType }
