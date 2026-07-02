import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowUpDown,
  ChevronRight,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react'
import { cn, formatNumber, getScoreColor, getScoreBg, getScoreLabel } from '@/lib/utils'
import {
  provinces as mockProvinces,
  dimensionKeys,
  getDimensionLabel,
  getProvinceByCode,
} from '@/lib/mock-data'
import type { Province, DimensionKey } from '@/lib/mock-data'
import { useProvinces } from '@/hooks/use-provinces'
import type { ProvinceRead } from '@/lib/api-types'
import { AlgeriaMap } from '@/components/map/algeria-map'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const sortOptions = [
  { id: 'name', tKey: 'common.name', label: 'Name' },
  { id: 'composite', tKey: 'common.compositeScore', label: 'Composite Score' },
  { id: 'population', tKey: 'common.population', label: 'Population' },
] as const

type SortKey = (typeof sortOptions)[number]['id']

const legendItems = ['Excellent', 'Good', 'Fair', 'Warning', 'Critical']

function getScoreGradient(score: number): string {
  if (score >= 90) return 'from-cyan-500 to-cyan-400'
  if (score >= 75) return 'from-emerald-500 to-emerald-400'
  if (score >= 60) return 'from-yellow-500 to-yellow-400'
  if (score >= 40) return 'from-orange-500 to-orange-400'
  return 'from-red-500 to-red-400'
}

function getMockScore(provinceCode: string, dimension: string): number {
  const mock = getProvinceByCode(provinceCode)
  if (!mock) return 50
  if (dimension === 'composite') return mock.compositeScore
  return mock.scores[dimension] ?? 50
}

function getMockPopulation(provinceCode: string): number {
  return getProvinceByCode(provinceCode)?.population ?? 0
}

export default function ProvincesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedDimension, setSelectedDimension] = useState('composite')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')

  const { data, isLoading, isError, error } = useProvinces({ page_size: 100 })

  const showCount = 10

  const filtered = useMemo(() => {
    if (!data) return []
    let list = [...data.items]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          (p.name_fr?.toLowerCase() || '').includes(q) ||
          (p.name_ar || '').includes(q) ||
          p.code.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return (a.name_fr || a.code).localeCompare(b.name_fr || b.code)
      const sa = getMockScore(a.code.toUpperCase(), selectedDimension)
      const sb = getMockScore(b.code.toUpperCase(), selectedDimension)
      return sb - sa
    })

    return list
  }, [data, searchQuery, sortBy, selectedDimension])

  const selectedProvince = selectedCode
    ? getProvinceByCode(selectedCode)
    : null

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden lg:flex-row">
      {/* Left Panel */}
      <div className="flex w-full shrink-0 flex-col border-surface-200 bg-white dark:border-navy-700 dark:bg-navy-900 lg:w-[35%] lg:border-l">
        {/* Header */}
        <div className="border-b border-surface-100 px-5 py-4 dark:border-navy-700">
          <h1 className="page-title text-lg">{t('provinces.title')}</h1>
          <p className="page-subtitle mt-0.5">
            {t('provinces.provincesCountFormat', { count: data?.total ?? 0 })}
          </p>
        </div>

        {/* Search */}
        <div className="border-b border-surface-100 px-4 py-3 dark:border-navy-700">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('provinces.searchProvinces')}
              className="form-input w-full py-2.5 pl-3 pr-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dimension Filters */}
        <div className="border-b border-surface-100 px-4 py-3 dark:border-navy-700">
          <div className="mb-2 flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-surface-400" />
            <span className="text-mini font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
              {t('provinces.dimension')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDimension('composite')}
              className={cn(
                'rounded-btn px-2.5 py-1.5 text-mini font-semibold uppercase tracking-wider transition-colors',
                selectedDimension === 'composite'
                  ? 'bg-algeria-500/10 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:bg-navy-800 dark:text-surface-400 dark:hover:bg-navy-700 dark:hover:text-surface-200',
              )}
            >
              {t('provinces.composite')}
            </button>
            {dimensionKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDimension(key)}
                className={cn(
                  'rounded-btn px-2.5 py-1.5 text-mini font-semibold uppercase tracking-wider transition-colors',
                  selectedDimension === key
                    ? 'bg-algeria-500/10 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:bg-navy-800 dark:text-surface-400 dark:hover:bg-navy-700 dark:hover:text-surface-200',
                )}
              >
                {getDimensionLabel(key)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between border-b border-surface-100 px-4 py-2 dark:border-navy-700">
          <span className="text-mini font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            {t('common.sortBy')}
          </span>
          <div className="flex gap-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                  className={cn(
                    'rounded-btn px-2 py-1 text-tiny font-medium transition-colors',
                    sortBy === opt.id
                      ? 'bg-algeria-500/10 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400'
                      : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
                  )}
              >
                {t(opt.tKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Province List */}
        <div className="flex-1 overflow-y-auto panel-scroll">
          {isLoading && (
            <div className="px-4 py-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="text" className="h-6 w-1 !rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" className="h-4 w-32" />
                    <Skeleton variant="text" className="h-3 w-20" />
                  </div>
                  <Skeleton variant="text" className="h-5 w-12 !rounded-btn" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="empty-state px-4">
              <AlertCircle className="empty-state-icon h-8 w-8 text-danger-500" />
              <p className="empty-state-desc">
                {(error as any)?.response?.data?.detail || t('common.error')}
              </p>
            </div>
          )}

          {data && filtered.length === 0 && (
            <div className="empty-state">
              <MapPin className="empty-state-icon h-8 w-8" />
              <p className="empty-state-desc">
                {t('provinces.noProvincesFound')}
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-1 text-tiny text-algeria-600 hover:text-algeria-500"
              >
                {t('provinces.clearSearch')}
              </button>
            </div>
          )}

          {data && filtered.length > 0 && (
            <>
              {filtered.slice(0, showCount).map((province: ProvinceRead, i: number) => {
                const code = province.code.toUpperCase()
                const val = getMockScore(code, selectedDimension)
                const population = getMockPopulation(code)
                const isSelected = selectedCode === code
                return (
                  <motion.button
                    key={code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    type="button"
                    onClick={() => setSelectedCode(code)}
                    onDoubleClick={() => navigate(`/provinces/${code.toLowerCase()}`)}
                    className={cn(
                      'relative flex w-full items-center gap-3 border-r-2 px-4 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-navy-800/50',
                      isSelected
                        ? 'border-r-algeria-500 bg-algeria-500/5 dark:bg-algeria-900/10'
                        : 'border-r-transparent',
                    )}
                  >
                    <div
                      className={cn(
                        'h-full w-1 shrink-0 rounded-full',
                        getScoreBg(val),
                      )}
                    />

                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="shrink-0 text-tiny text-surface-400 dark:text-surface-500">
                          {code}
                        </span>
                        <span className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                          {province.name_fr || code}
                        </span>
                      </div>
                      <span className="text-xs text-surface-400 dark:text-surface-500 block">
                        {province.name_ar}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-0.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-btn px-2 py-0.5 text-xs font-bold tabular-nums',
                          val >= 75
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : val >= 50
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        )}
                      >
                        {val}
                      </span>
                      <span className="text-tiny text-surface-400 dark:text-surface-500">
                        {formatNumber(population)}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
              {filtered.length > showCount && (
                <div className="border-t border-surface-100 px-4 py-3 text-center dark:border-navy-700">
                  <span className="text-tiny text-surface-400">
                    {t('provinces.moreProvinces', { count: filtered.length - showCount })}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel — Map */}
      <div className="relative flex-1">
        {/* Legend floating */}
        <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-card border border-surface-200/70 bg-white/90 px-3 py-2.5 shadow-soft backdrop-blur-xl dark:border-navy-700/50 dark:bg-navy-900/90">
          <p className="mb-2 text-mini font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            {selectedDimension === 'composite' ? t('map.compositeScore') : getDimensionLabel(selectedDimension)}
          </p>
          <div className="space-y-1">
            {legendItems.map((l) => (
              <div key={l} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-sm bg-score-${l.toLowerCase()}`} />
                <span className="text-tiny text-surface-500 dark:text-surface-400">
                  {t(`map.${l.toLowerCase()}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AlgeriaMap
          selectedProvince={selectedCode ?? undefined}
          onProvinceSelect={(code) => navigate(`/provinces/${code.toLowerCase()}`)}
          className="h-full min-h-[400px]"
        />
      </div>
    </div>
  )
}
