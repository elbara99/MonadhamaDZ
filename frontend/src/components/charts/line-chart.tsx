import { useMemo } from 'react'
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface LineChartProps {
  data: { date: string; value: number }[]
  height?: number
  color?: string
  showArea?: boolean
  className?: string
}

function CustomTooltip({ active, payload, label }: any) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-card dark:border-surface-800 dark:bg-surface-900">
      <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
        {label}
      </p>
      <p className="text-sm text-surface-500 dark:text-surface-400">
        {t('common.value')}: <span className="font-semibold text-primary-500">{val}</span>
      </p>
    </div>
  )
}

function LineChart({
  data,
  height = 300,
  color = '#336dff',
  showArea = false,
  className,
}: LineChartProps) {
  const gradientId = useMemo(
    () => `lineGradient-${Math.random().toString(36).slice(2, 9)}`,
    [],
  )

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLine
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-surface-200 dark:stroke-surface-800"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12,
              className: 'fill-surface-500 dark:fill-surface-400',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 12,
              className: 'fill-surface-500 dark:fill-surface-400',
            }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showArea && (
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#${gradientId})`}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{
              r: 3,
              fill: color,
              strokeWidth: 2,
              stroke: '#fff',
            }}
            activeDot={{
              r: 5,
              fill: color,
              strokeWidth: 2,
              stroke: '#fff',
            }}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  )
}

export { LineChart, type LineChartProps }
