import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  layout?: 'horizontal' | 'vertical'
  className?: string
}

function getValueColor(value: number): string {
  if (value >= 75) return '#22c55e'
  if (value >= 50) return '#f59e0b'
  if (value >= 25) return '#f97316'
  return '#ef4444'
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

function BarChart({
  data,
  height = 300,
  showValues = false,
  layout = 'vertical',
  className,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar
          data={data}
          layout={layout}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          barCategoryGap="20%"
        >
          <XAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'vertical' ? undefined : 'label'}
            tick={{
              fontSize: 12,
              className: 'fill-surface-500 dark:fill-surface-400',
            }}
            axisLine={false}
            tickLine={false}
            domain={layout === 'vertical' ? [0, 100] : undefined}
            hide={layout === 'vertical'}
          />
          <YAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? 'label' : undefined}
            tick={{
              fontSize: 12,
              className: 'fill-surface-500 dark:fill-surface-400',
            }}
            axisLine={false}
            tickLine={false}
            width={100}
            hide={layout === 'horizontal'}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color ?? getValueColor(entry.value)}
              />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  )
}

export { BarChart, type BarChartProps }
