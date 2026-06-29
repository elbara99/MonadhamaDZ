import { cn } from '@/lib/utils'

const shimmerBase =
  'bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 dark:from-surface-800 dark:via-surface-700 dark:to-surface-800 bg-[length:200%_100%] animate-shimmer'

const variants = {
  text: 'h-4 w-full rounded-md',
  card: 'h-32 w-full rounded-xl',
  chart: 'h-48 w-full rounded-xl',
  map: 'h-64 w-full rounded-xl',
} as const

interface SkeletonProps {
  variant?: keyof typeof variants
  className?: string
  width?: string | number
  height?: string | number
  count?: number
}

const defaultDims: Record<keyof typeof variants, { w: string; h: string }> = {
  text: { w: '100%', h: '16px' },
  card: { w: '100%', h: '128px' },
  chart: { w: '100%', h: '192px' },
  map: { w: '100%', h: '256px' },
}

function Skeleton({
  variant = 'text',
  className,
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const dims = defaultDims[variant]
  const style = {
    width: width ?? dims.w,
    height: height ?? dims.h,
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(shimmerBase, variants[variant], className)}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export { Skeleton, type SkeletonProps }
