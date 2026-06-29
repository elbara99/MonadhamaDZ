'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Plus,
  X,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Radar as RadarIcon,
  Target,
  ArrowUpDown,
  Check,
  ChevronDown,
} from 'lucide-react'
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import { cn, getScoreColor, getScoreLabel } from '@/lib/utils'
import {
  provinces,
  dimensionKeys,
  getDimensionLabel,
  getProvinceByCode,
} from '@/lib/mock-data'
import type { Province, DimensionKey } from '@/lib/mock-data'
import { PriorityScore } from '@/components/scores/priority-score'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const COMPARE_COLORS = ['#336dff', '#f59e0b', '#22c55e', '#ef4444']
const MAX_COMPARE = 4

const defaultCodes = ['DZ-16', 'DZ-31', 'DZ-25', 'DZ-15']

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}

function RadarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-card dark:border-surface-800 dark:bg-surface-900">
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function BarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-card dark:border-surface-800 dark:bg-surface-900">
      <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function getBestAndWorst(
  dimension: string,
  selected: Province[],
): { best: number; worst: number } {
  const scores = selected.map((p) => p.scores[dimension] ?? 0)
  return {
    best: Math.max(...scores),
    worst: Math.min(...scores),
  }
}

export default function ComparePage() {
  const { t } = useTranslation()
  const [selectedCodes, setSelectedCodes] = useState<string[]>(defaultCodes)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [compareIndicator, setCompareIndicator] = useState<string>('unemploymentRate')

  const selectedProvinces = useMemo(
    () => selectedCodes.map((code) => getProvinceByCode(code)).filter(Boolean) as Province[],
    [selectedCodes],
  )

  const availableProvinces = useMemo(
    () => provinces.filter((p) => !selectedCodes.includes(p.code)),
    [selectedCodes],
  )

  const indicatorOptions = useMemo(() => [
    { id: 'populationGrowth', label: t('compare.populationGrowth') },
    { id: 'unemploymentRate', label: t('compare.unemploymentRate') },
    { id: 'literacyRate', label: t('compare.literacyRate') },
    { id: 'povertyRate', label: t('compare.povertyRate') },
    { id: 'internetAccess', label: t('compare.internetAccess') },
    { id: 'cleanWaterAccess', label: t('compare.cleanWaterAccess') },
  ] as const, [t])

  function addProvince(code: string) {
    if (selectedCodes.length < MAX_COMPARE && !selectedCodes.includes(code)) {
      setSelectedCodes([...selectedCodes, code])
    }
    setDropdownOpen(false)
  }

  function removeProvince(code: string) {
    setSelectedCodes(selectedCodes.filter((c) => c !== code))
  }

  function resetProvinces() {
    setSelectedCodes(defaultCodes)
  }

  const radarComparisonData = useMemo(() => {
    return dimensionKeys.map((key) => {
      const entry: Record<string, string | number> = {
        dimension: getDimensionLabel(key),
      }
      for (const p of selectedProvinces) {
        entry[p.code] = p.scores[key] ?? 0
      }
      return entry
    })
  }, [selectedProvinces])

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 pb-16">
      {/* Header */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
              {t('compare.title')}
            </h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {t('compare.description')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetProvinces}>
              {t('common.reset')}
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              {t('compare.exportComparison')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Selection Bar */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                {t('compare.selectedProvinces')}
              </span>
              {selectedProvinces.map((p, i) => (
                <span
                  key={p.code}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                    'text-white',
                  )}
                  style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removeProvince(p.code)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {selectedCodes.length < MAX_COMPARE && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('compare.addProvince')}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-56 overflow-y-auto rounded-xl border border-surface-200 bg-white p-1 shadow-lg dark:border-surface-700 dark:bg-surface-900">
                        {availableProvinces.length === 0 ? (
                          <p className="px-3 py-4 text-center text-xs text-surface-400">
                            {t('compare.allProvincesSelected')}
                          </p>
                        ) : (
                          availableProvinces.map((p) => (
                            <button
                              key={p.code}
                              type="button"
                              onClick={() => addProvince(p.code)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-surface-100 text-2xs text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                                {p.code.slice(-2)}
                              </span>
                              {p.name}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedCodes.length < 2 && (
                <span className="text-xs text-danger-500">
                  {t('compare.selectAtLeastTwo')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedProvinces.length >= 2 && (
        <>
          {/* Score Overview */}
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="mb-5 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                {t('compare.scoreOverview')}
              </h2>
            </div>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(selectedProvinces.length, 4)}, 1fr)`,
              }}
            >
              {selectedProvinces.map((p, i) => (
                <Card key={p.code}>
                  <CardContent className="flex flex-col items-center p-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-surface-900 dark:text-white">
                        {p.name}
                      </span>
                      <Badge variant="default" size="sm">{p.code}</Badge>
                    </div>
                    <PriorityScore score={p.compositeScore} size="md" className="mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Radar Comparison */}
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <RadarIcon className="h-5 w-5 text-primary-500" />
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    {t('compare.radarComparison')}
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={440}>
                  <RechartsRadar
                    data={radarComparisonData}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                  >
                    <PolarGrid
                      stroke="var(--tw-grid-color, #e4e7ed)"
                      className="[--tw-grid-color:#e4e7ed] dark:[--tw-grid-color:#2a3441]"
                    />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{
                        fontSize: 11,
                        fill: 'currentColor',
                        className: 'fill-surface-600 dark:fill-surface-400',
                      }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{
                        fontSize: 10,
                        fill: 'currentColor',
                        className: 'fill-surface-400 dark:fill-surface-600',
                      }}
                    />
                    <Tooltip content={<RadarTooltip />} />
                    <Legend
                      formatter={(value) => {
                        const p = selectedProvinces.find((pr) => pr.code === value)
                        return p?.name ?? value
                      }}
                      wrapperStyle={{
                        fontSize: 12,
                        paddingTop: 16,
                      }}
                    />
                    {selectedProvinces.map((p, i) => (
                      <Radar
                        key={p.code}
                        name={p.code}
                        dataKey={p.code}
                        stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                        fill={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                        dot={{
                          r: 2,
                          fill: COMPARE_COLORS[i % COMPARE_COLORS.length],
                        }}
                        activeDot={{
                          r: 4,
                          fill: COMPARE_COLORS[i % COMPARE_COLORS.length],
                        }}
                      />
                    ))}
                  </RechartsRadar>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.section>

          {/* Dimension Comparison Table */}
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="mb-5 flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                {t('compare.dimensionComparison')}
              </h2>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-200 dark:border-surface-800">
                        <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:bg-surface-900 dark:text-surface-400">
                          {t('common.dimension')}
                        </th>
                        {selectedProvinces.map((p, i) => (
                          <th
                            key={p.code}
                            className="px-4 py-3 text-center text-2xs font-semibold uppercase tracking-widest"
                            style={{ color: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dimensionKeys.map((dim) => {
                        const { best, worst } = getBestAndWorst(dim, selectedProvinces)
                        return (
                          <tr
                            key={dim}
                            className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/30"
                          >
                            <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-surface-700 dark:bg-surface-900 dark:text-surface-300">
                              {getDimensionLabel(dim)}
                            </td>
                            {selectedProvinces.map((p) => {
                              const score = p.scores[dim] ?? 0
                              const isBest = score === best
                              const isWorst = score === worst
                              return (
                                <td
                                  key={p.code}
                                  className={cn(
                                    'px-4 py-3 text-center text-sm font-bold tabular-nums',
                                    isBest && !isWorst && 'text-emerald-500',
                                    isWorst && !isBest && 'text-red-500',
                                    !isBest && !isWorst && getScoreColor(score),
                                  )}
                                >
                                  <span className="relative">
                                    {score}
                                    {isBest && !isWorst && (
                                      <span className="absolute -right-3 -top-1 text-2xs text-emerald-500">
                                        ▲
                                      </span>
                                    )}
                                    {isWorst && !isBest && (
                                      <span className="absolute -right-3 -top-1 text-2xs text-red-500">
                                        ▼
                                      </span>
                                    )}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Bar Chart Comparison */}
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-500" />
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                      {t('compare.indicatorComparison')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-500 dark:text-surface-400">
                      {t('common.indicator')}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {indicatorOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCompareIndicator(opt.id)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-2xs font-medium transition-colors',
                            compareIndicator === opt.id
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                              : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <RechartsBarChart
                    data={selectedProvinces.map((p) => ({
                      name: p.name,
                      value: p.indicators[compareIndicator] ?? 0,
                    }))}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-surface-200 dark:stroke-surface-800"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        className: 'fill-surface-600 dark:fill-surface-400',
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
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {selectedProvinces.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.section>

          {/* Strengths & Weaknesses */}
          <motion.section
            custom={6}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                {t('compare.strengthsAndWeaknesses')}
              </h2>
            </div>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(selectedProvinces.length, 4)}, 1fr)`,
              }}
            >
              {selectedProvinces.map((p, i) => {
                const sorted = [...dimensionKeys].sort(
                  (a, b) => (p.scores[b] ?? 0) - (p.scores[a] ?? 0),
                )
                const strengths = sorted.slice(0, 3)
                const weaknesses = sorted.slice(-3).reverse()
                return (
                  <Card key={p.code}>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                        />
                        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                          {p.name}
                        </h3>
                        <span className="text-2xs text-surface-400">{p.code}</span>
                      </div>

                      <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-emerald-500">
                        {t('compare.strengths')}
                      </p>
                      <div className="mb-4 space-y-1">
                        {strengths.map((d) => (
                          <div
                            key={d}
                            className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/20"
                          >
                            <span className="text-xs text-surface-600 dark:text-surface-400">
                              {getDimensionLabel(d)}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {p.scores[d]}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-red-500">
                        {t('compare.weaknesses')}
                      </p>
                      <div className="space-y-1">
                        {weaknesses.map((d) => (
                          <div
                            key={d}
                            className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-1.5 dark:bg-red-950/20"
                          >
                            <span className="text-xs text-surface-600 dark:text-surface-400">
                              {getDimensionLabel(d)}
                            </span>
                            <span className="text-xs font-bold text-red-500">
                              {p.scores[d]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </motion.section>

          {/* Export */}
          <motion.div
            custom={7}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="flex justify-center"
          >
            <Button variant="primary" className="gap-2" size="lg">
              <Download className="h-4 w-4" />
              {t('compare.exportComparisonReport')}
            </Button>
          </motion.div>
        </>
      )}
    </div>
  )
}
