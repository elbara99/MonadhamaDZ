import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { GaugeChart } from '@/components/charts/gauge-chart'

interface PriorityScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getStatusVariant(score: number): {
  text: string
  label: string
  color: string
} {
  if (score >= 90)
    return { text: 'text-score-excellent', label: 'excellent', color: '#06b6d4' }
  if (score >= 75)
    return { text: 'text-score-good', label: 'good', color: '#22c55e' }
  if (score >= 60)
    return { text: 'text-score-fair', label: 'fair', color: '#eab308' }
  if (score >= 40)
    return { text: 'text-score-warning', label: 'warning', color: '#f59e0b' }
  return { text: 'text-score-critical', label: 'critical', color: '#ef4444' }
}

const sizeMap = {
  sm: { gauge: 120, title: 'text-xs' },
  md: { gauge: 180, title: 'text-sm' },
  lg: { gauge: 240, title: 'text-base' },
} as const

function PriorityScore({
  score,
  size = 'md',
  showLabel = true,
  className,
}: PriorityScoreProps) {
  const { t } = useTranslation()
  const { gauge: gaugeSize, title: titleSize } = sizeMap[size]
  const status = getStatusVariant(Math.min(score, 100))
  const label = t(`scores.${status.label}`)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex flex-col items-center gap-2', className)}
    >
      <GaugeChart
        value={Math.min(score, 100)}
        max={100}
        size={gaugeSize}
        label={label}
      />
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              'font-medium text-surface-500 dark:text-surface-400',
              titleSize,
            )}
          >
            {t('scores.priorityScore')}
          </span>
          <motion.span
            key={status.label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('text-xs font-semibold', status.text)}
          >
            {t(`scores.${status.label}`)}
          </motion.span>
        </div>
      )}
    </motion.div>
  )
}

export { PriorityScore, type PriorityScoreProps }
