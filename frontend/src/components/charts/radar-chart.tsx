import { useMemo } from 'react'
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface RadarChartProps {
  data: { dimension: string; value: number; fullMark: number }[]
  size?: number
  className?: string
}

function CustomTooltip({ active, payload }: any) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const { dimension, value } = payload[0].payload
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-card dark:border-surface-800 dark:bg-surface-900">
      <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
        {dimension}
      </p>
      <p className="text-sm text-surface-500 dark:text-surface-400">
        {t('common.score')}: <span className="font-semibold text-primary-500">{value}</span>
      </p>
    </div>
  )
}

function RadarChart({
  data,
  size = 400,
  className,
}: RadarChartProps) {
  const { t } = useTranslation()
  const gradientId = useMemo(
    () => `radarGradient-${Math.random().toString(36).slice(2, 9)}`,
    [],
  )

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={size}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="80%">
          <defs>
            <radialGradient id={gradientId}>
              <stop offset="0%" stopColor="rgb(51, 109, 255)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgb(51, 109, 255)" stopOpacity={0.05} />
            </radialGradient>
          </defs>
          <PolarGrid
            stroke="var(--tw-grid-color, #e4e7ed)"
            className="[--tw-grid-color:#e4e7ed] dark:[--tw-grid-color:#2a3441]"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: 'currentColor',
              fontSize: 12,
              className:
                'fill-surface-600 dark:fill-surface-400',
            }}
            className="text-surface-600 dark:text-surface-400"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{
              fill: 'currentColor',
              fontSize: 10,
              className:
                'fill-surface-400 dark:fill-surface-600',
            }}
            className="text-surface-400 dark:text-surface-600"
          />
          <Radar
            name={t('common.score')}
            dataKey="value"
            stroke="#336dff"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={{
              r: 3,
              fill: '#336dff',
              strokeWidth: 2,
              stroke: '#fff',
            }}
            activeDot={{
              r: 5,
              fill: '#336dff',
              strokeWidth: 2,
              stroke: '#fff',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}

export { RadarChart, type RadarChartProps }
