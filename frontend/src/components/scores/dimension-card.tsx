import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronsDown,
} from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'

interface DimensionCardProps {
  dimension: string
  score: number
  trend?: 'improving' | 'stable' | 'declining' | 'critical'
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

const trendConfig = {
  improving: {
    icon: TrendingUp,
    color: 'text-score-good',
    labelKey: 'common.improving',
  },
  stable: {
    icon: ArrowRight,
    color: 'text-score-fair',
    labelKey: 'common.stable',
  },
  declining: {
    icon: TrendingDown,
    color: 'text-score-warning',
    labelKey: 'common.declining',
  },
  critical: {
    icon: ChevronsDown,
    color: 'text-score-critical',
    labelKey: 'common.critical',
  },
} as const

function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(0)
  const animFrame = useRef<number | null>(null)

  useEffect(() => {
    const start = prevTarget.current
    const startTime = performance.now()

    function animate(time: number) {
      const elapsed = time - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(start + (target - start) * eased)
      if (t < 1) {
        animFrame.current = requestAnimationFrame(animate)
      } else {
        prevTarget.current = target
      }
    }

    if (animFrame.current !== null) cancelAnimationFrame(animFrame.current)
    animFrame.current = requestAnimationFrame(animate)

    return () => {
      if (animFrame.current !== null) cancelAnimationFrame(animFrame.current)
    }
  }, [target, duration])

  return Math.round(count)
}

function DimensionCard({
  dimension,
  score,
  trend,
  icon,
  onClick,
  className,
}: DimensionCardProps) {
  const { t } = useTranslation()
  const animatedScore = useCounter(Math.min(score, 100))
  const scoreColorClass = getScoreColor(Math.min(score, 100))
  const TrendIcon = trend ? trendConfig[trend].icon : null
  const trendColor = trend ? trendConfig[trend].color : ''

  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-surface-200 bg-white p-4 shadow-card transition-shadow duration-200 dark:border-surface-800 dark:bg-surface-900',
        onClick && 'cursor-pointer hover:shadow-card-hover',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-950/30">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
              {dimension}
            </p>
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                scoreColorClass,
              )}
            >
              {animatedScore}
            </span>
          </div>
        </div>
        {TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full bg-surface-100 px-2 py-1 text-2xs font-medium dark:bg-surface-800',
              trendColor,
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{t(trendConfig[trend!].labelKey)}</span>
          </div>
        )}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className={cn(
            'h-full rounded-full transition-colors duration-500',
            score >= 75 && 'bg-score-good',
            score >= 50 && score < 75 && 'bg-score-fair',
            score >= 25 && score < 50 && 'bg-score-warning',
            score < 25 && 'bg-score-critical',
          )}
        />
      </div>
    </motion.div>
  )
}

export { DimensionCard, type DimensionCardProps }
