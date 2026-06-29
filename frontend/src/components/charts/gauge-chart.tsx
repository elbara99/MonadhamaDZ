import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface GaugeChartProps {
  value: number
  max?: number
  size?: number
  label?: string
  className?: string
}

function getArcColor(ratio: number): string {
  if (ratio >= 0.9) return '#06b6d4'
  if (ratio >= 0.75) return '#22c55e'
  if (ratio >= 0.6) return '#eab308'
  if (ratio >= 0.4) return '#f59e0b'
  return '#ef4444'
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const rad = ((angleDeg - 180) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function GaugeChart({
  value,
  max = 100,
  size = 200,
  label,
  className,
}: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const prevValue = useRef(0)
  const animFrame = useRef<number | null>(null)

  const ratio = Math.min(value / max, 1)
  const arcColor = getArcColor(ratio)

  const strokeWidth = size * 0.08
  const cx = size / 2
  const cy = size / 2
  const radius = (size - strokeWidth) / 2 - size * 0.02
  const startAngle = -220
  const endAngle = 40
  const arcLength = endAngle - startAngle
  const filledEnd = startAngle + arcLength * ratio

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const duration = 800
    const startTime = performance.now()

    function animate(time: number) {
      const elapsed = time - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedValue(start + (end - start) * eased)
      if (t < 1) {
        animFrame.current = requestAnimationFrame(animate)
      } else {
        prevValue.current = end
      }
    }

    if (animFrame.current !== null) cancelAnimationFrame(animFrame.current)
    animFrame.current = requestAnimationFrame(animate)

    return () => {
      if (animFrame.current !== null) cancelAnimationFrame(animFrame.current)
    }
  }, [value])

  const displayValue = Math.round(animatedValue)

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-glow"
      >
        <path
          d={describeArc(cx, cy, radius, startAngle, endAngle)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          className="text-surface-200 dark:text-surface-800"
        />
        <path
          d={describeArc(cx, cy, radius, startAngle, filledEnd)}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          className="transition-colors duration-500"
          style={{
            filter: `drop-shadow(0 0 4px ${arcColor}40)`,
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-mono text-3xl font-bold tracking-tight tabular-nums transition-colors duration-500"
          style={{ color: arcColor }}
        >
          {displayValue}
        </span>
        {label && (
          <span className="mt-1 text-xs font-medium text-surface-500 dark:text-surface-400">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

export { GaugeChart, type GaugeChartProps }
