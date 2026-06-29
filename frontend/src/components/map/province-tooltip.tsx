import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn, formatNumber } from '@/lib/utils'
import type { Province } from '@/lib/mock-data'

interface ProvinceTooltipProps {
  province: Province
  position: { x: number; y: number }
  className?: string
}

function getBadgeVariant(score: number): 'danger' | 'warning' | 'success' | 'info' {
  if (score >= 90) return 'info'
  if (score >= 75) return 'success'
  if (score >= 60) return 'warning'
  if (score >= 40) return 'warning'
  return 'danger'
}

function getScoreKey(score: number): string {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 40) return 'warning'
  return 'critical'
}

const variantStyles: Record<string, string> = {
  danger: 'bg-danger-500/15 text-danger-500 dark:text-danger-400 border-danger-500/30',
  warning: 'bg-warning-500/15 text-warning-600 dark:text-warning-400 border-warning-500/30',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
}

export function ProvinceTooltip({ province, position, className }: ProvinceTooltipProps) {
  const { t } = useTranslation()
  const variant = getBadgeVariant(province.compositeScore)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'pointer-events-none absolute z-[1000] w-64 -translate-x-1/2 -translate-y-full pb-3',
        className,
      )}
      style={{ left: position.x, top: position.y }}
    >
      <div className="relative rounded-xl border border-white/20 bg-white/70 p-4 shadow-modal backdrop-blur-xl dark:border-surface-700/50 dark:bg-surface-900/70">
        <div className="absolute -bottom-[5px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/20 bg-white/70 backdrop-blur-xl dark:border-surface-700/50 dark:bg-surface-900/70" />

        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
          {province.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
              variantStyles[variant],
            )}
          >
            {province.compositeScore}
            <span className="ml-1 opacity-70">{t(`map.${getScoreKey(province.compositeScore)}`)}</span>
          </span>
          <span className="text-xs text-surface-500 dark:text-surface-400">
            {formatNumber(province.population)}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <IndicatorRow
            label={t('provinceDetail.unemploymentRate')}
            value={province.indicators.unemploymentRate}
            unit="%"
          />
          <IndicatorRow
            label={t('provinceDetail.literacyRate')}
            value={province.indicators.literacyRate}
            unit="%"
          />
          <IndicatorRow
            label={t('provinceDetail.hospitalBedsPer1000')}
            value={province.indicators.hospitalBedsPer1000}
            unit="/1K"
          />
        </div>
      </div>
    </motion.div>
  )
}

function IndicatorRow({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-surface-500 dark:text-surface-400">{label}</span>
      <span className="font-medium text-surface-700 dark:text-surface-300">
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
  )
}
