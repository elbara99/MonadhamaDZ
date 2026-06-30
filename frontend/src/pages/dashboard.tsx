'use client'

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  MapPin,
  Globe,
  Shield,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Search,
  Eye,
  ExternalLink,
  AlertCircle,
  Info,
  FileText,
  Target,
  Zap,
  Layers,
  ArrowUpDown,
  Clock,
} from 'lucide-react'
import { cn, formatNumber, getScoreColor } from '@/lib/utils'
import { alerts, insights, decisions, getProvinceByCode } from '@/lib/mock-data'
import { useProvinces } from '@/hooks/use-provinces'
import { AlgeriaMap } from '@/components/map/algeria-map'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchStore } from '@/hooks/use-search'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: 0.05 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const insightIcons: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  risk: AlertTriangle,
  opportunity: TrendingUp,
  anomaly: Activity,
}

const insightColors: Record<string, string> = {
  trend: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  risk: 'text-danger-500 bg-danger-100 dark:bg-danger-900/30 dark:text-danger-400',
  opportunity: 'text-accent-500 bg-accent-100 dark:bg-accent-900/30 dark:text-accent-400',
  anomaly: 'text-warning-500 bg-warning-100 dark:bg-warning-900/30 dark:text-warning-400',
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'danger' | 'success' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'primary' },
  rejected: { label: 'Rejected', variant: 'danger' },
  implemented: { label: 'Implemented', variant: 'success' },
}

const alertBorder: Record<string, string> = {
  critical: 'border-l-danger-500',
  warning: 'border-l-warning-500',
  info: 'border-l-sky-500',
}

const alertDot: Record<string, string> = {
  critical: 'bg-danger-500',
  warning: 'bg-warning-500',
  info: 'bg-sky-500',
}

function getTrendIcon(trend: number) {
  if (trend >= 0) return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
  return <ArrowDownRight className="h-3.5 w-3.5 text-danger-500" />
}

function getTrendColor(trend: number) {
  return trend >= 0 ? 'text-emerald-500' : 'text-danger-500'
}

const kpiCards = [
  { icon: Users, tKey: 'dashboard.population', value: '45.6M', trend: '+1.8%', trendUp: true },
  { icon: TrendingUp, tKey: 'dashboard.gdpNominal', value: '$224B', trend: '+3.2%', trendUp: true },
  { icon: BarChart3, tKey: 'dashboard.avgCompositeScore', value: '61.4', trend: '+0.8', trendUp: true },
  { icon: AlertTriangle, tKey: 'dashboard.provincesInAlert', value: '3', trend: 'critical', trendUp: false },
  { icon: Globe, tKey: 'dashboard.dataSourcesActive', value: '47/58', trend: '81%', trendUp: true },
  { icon: FileText, tKey: 'dashboard.activeDecisions', value: '5', trend: 'pending', trendUp: false },
]

const dimensionFilters = [
  { id: 'overall', tKey: 'common.overall' },
  { id: 'health', tKey: 'common.health' },
  { id: 'education', tKey: 'common.education' },
  { id: 'economy', tKey: 'common.economy' },
  { id: 'infrastructure', tKey: 'common.infrastructure' },
  { id: 'security', tKey: 'common.security' },
  { id: 'employment', tKey: 'common.employment' },
]

const legendItems = ['Excellent', 'Good', 'Fair', 'Warning', 'Critical']

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const searchStore = useSearchStore()
  const [rankFilter, setRankFilter] = useState('overall')
  const [showFullRankings, setShowFullRankings] = useState(false)

  const { data: provincesData, isLoading: provincesLoading, isError: provincesError } = useProvinces({ page_size: 100 })

  const timeAgo = useCallback((dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('time.justNow')
    if (mins < 60) return t('time.minutesAgo', { count: mins })
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return t('time.hoursAgo', { count: hrs })
    const days = Math.floor(hrs / 24)
    return t('time.daysAgo', { count: days })
  }, [t])

  const ranked = useMemo(() => {
    if (!provincesData?.items.length) return []
    const sorted = [...provincesData.items].sort((a, b) => {
      const mockA = getProvinceByCode(a.code.toUpperCase())
      const mockB = getProvinceByCode(b.code.toUpperCase())
      if (rankFilter === 'overall') return (mockB?.compositeScore ?? 50) - (mockA?.compositeScore ?? 50)
      return (mockB?.scores[rankFilter] ?? 50) - (mockA?.scores[rankFilter] ?? 50)
    })
    return sorted.map((p, i) => {
      const mock = getProvinceByCode(p.code.toUpperCase())
      return {
        rank: i + 1,
        code: p.code.toUpperCase(),
        name: p.name_fr || p.code,
        nameAr: p.name_ar,
        compositeScore: mock?.compositeScore ?? 50,
        scores: mock?.scores ?? {},
        trends: mock?.trends ?? {},
        population: mock?.population ?? 0,
        score: rankFilter === 'overall' ? (mock?.compositeScore ?? 50) : (mock?.scores[rankFilter] ?? 50),
        change: Math.round((Math.random() - 0.4) * 6 - 2),
      }
    })
  }, [provincesData, rankFilter])

  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()
  const display = showFullRankings ? ranked : [...top5, ...bottom5]

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 }
        return order[a.type] - order[b.type]
      }),
    [],
  )

  return (
    <div className="mx-auto max-w-[1440px] space-y-10 pb-12">
      {/* Section 1 — Header + Search */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
              {t('dashboard.executiveOverview')}
            </h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {t('dashboard.monitoredProvincesFull')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => searchStore.open()}
            className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 text-sm text-surface-400 shadow-sm transition-all hover:border-surface-300 hover:text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:hover:border-surface-600 sm:mt-0 sm:w-72"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{t('dashboard.quickSearch')}</span>
            <kbd className="rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-2xs font-medium text-surface-400 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-500">
              ⌘K
            </kbd>
          </button>
        </div>
      </motion.div>

      {/* Section 2 — National KPI Bar */}
      <motion.section
        custom={1}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {kpiCards.map((kpi, i) => (
            <motion.div
              key={kpi.tKey}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="flex shrink-0 items-center gap-4 rounded-2xl border border-surface-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-900/60"
              style={{ minWidth: 200 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
                  {t(kpi.tKey)}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-surface-900 dark:text-white">
                    {kpi.value}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      kpi.trendUp ? 'text-emerald-500' : 'text-danger-500',
                    )}
                  >
                    {kpi.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 3 — Map + Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Map */}
        <motion.section
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="lg:col-span-3"
        >
          <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white shadow-sm dark:border-surface-800/50 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-100 px-5 py-3 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
                  {t('map.title')}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-2xs">
                {legendItems.map((l) => (
                  <div key={l} className="flex items-center gap-1">
                    <span className={`h-2.5 w-2.5 rounded-sm bg-score-${l.toLowerCase()}`} />
                    <span className="text-surface-500 dark:text-surface-400">{t(`map.${l.toLowerCase()}`)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[420px]">
              <AlgeriaMap
                onProvinceSelect={(code) => navigate(`/provinces/${code.toLowerCase()}`)}
              />
            </div>
          </div>
        </motion.section>

        {/* Alerts */}
        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="lg:col-span-2"
        >
          <div className="flex h-full flex-col rounded-2xl border border-surface-200/70 bg-white shadow-sm dark:border-surface-800/50 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-100 px-5 py-3 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning-500" />
                <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
                  {t('dashboard.alerts')}
                </h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-2xs font-bold text-white">
                  {alerts.filter((a) => a.type === 'critical').length}
                </span>
              </div>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                {t('common.viewAll')}
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {sortedAlerts.map((alert) => {
                const province = getProvinceByCode(alert.provinceCode)
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'group cursor-pointer rounded-xl border-l-4 p-3.5 transition-all hover:bg-surface-50 dark:hover:bg-surface-800/50',
                      alertBorder[alert.type],
                      'border-surface-200/50 bg-white dark:border-surface-700/50 dark:bg-surface-900',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full', alertDot[alert.type])} />
                          <h3 className="truncate text-sm font-medium text-surface-900 dark:text-white">
                            {alert.title}
                          </h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-surface-500 dark:text-surface-400">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {province && (
                        <Badge variant="default" size="sm">
                          {province.name}
                        </Badge>
                      )}
                      <span className="text-2xs text-surface-400 dark:text-surface-500">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Section 4 — AI Insights */}
      <motion.section
        custom={4}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="mb-5 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            {t('dashboard.aiGeneratedInsights')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight, i) => {
            const Icon = insightIcons[insight.type]
            const province = getProvinceByCode(insight.provinceCode)
            return (
              <motion.div
                key={insight.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="group relative overflow-hidden rounded-2xl border border-surface-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-800/50 dark:bg-surface-900/60"
              >
                <div className={cn('mb-3 inline-flex rounded-lg p-2.5', insightColors[insight.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                  {insight.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
                  {insight.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {province && (
                    <Badge variant="default" size="sm">
                      {province.name}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="gap-1 text-xs opacity-0 group-hover:opacity-100">
                    {t('dashboard.explore')} <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-primary-500/5 blur-2xl group-hover:bg-primary-500/10" />
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Section 5 — Province Rankings */}
      <motion.section
        custom={5}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              {t('dashboard.provinceRankings')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-500 dark:text-surface-400">{t('dashboard.filterByDimension')}</span>
            <div className="flex flex-wrap gap-1">
              {dimensionFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRankFilter(f.id)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    rankFilter === f.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200',
                  )}
                >
                  {t(f.tKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white shadow-sm dark:border-surface-800/50 dark:bg-surface-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="w-12 px-4 py-3 text-left text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                    {t('dashboard.rank')}
                  </th>
                  <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                    {t('dashboard.province')}
                  </th>
                  <th className="px-4 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                    {t('dashboard.score')}
                  </th>
                  <th className="hidden px-4 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400 sm:table-cell">
                    {t('dashboard.change')}
                  </th>
                  <th className="hidden px-4 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400 md:table-cell">
                    {t('dashboard.keyIssue')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {display.map((p, idx) => {
                  const isTop5 = idx < 5
                  const isBottom = idx >= 5 && !showFullRankings
                  const change = p.change
                  return (
                    <tr
                      key={p.code}
                      onClick={() => navigate(`/provinces/${p.code.toLowerCase()}`)}
                      className={cn(
                        'cursor-pointer border-b border-surface-50 transition-colors last:border-0 hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-800/30',
                        isBottom && 'border-t-2 border-surface-200 dark:border-surface-700',
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold',
                              p.rank <= 3
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                                : 'text-surface-500 dark:text-surface-400',
                            )}
                          >
                            {p.rank}
                          </span>
                          {isTop5 && !showFullRankings && idx === 4 && (
                            <span className="text-2xs text-surface-400">...</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-surface-900 dark:text-white">
                          {p.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('font-bold', getScoreColor(p.score))}>
                          {p.score}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          {getTrendIcon(change)}
                          <span className={cn('text-xs font-medium', getTrendColor(change))}>
                            {change >= 0 ? `+${change}` : change}
                          </span>
                        </div>
                      </td>
                      <td className="hidden max-w-[180px] truncate px-4 py-3 text-right text-xs text-surface-500 dark:text-surface-400 md:table-cell">
                        {(() => {
                          const trendKey = rankFilter === 'overall' ? 'economy' : rankFilter
                          const trend = p.trends[trendKey]
                          const isDeclining = trend === 'declining' || trend === 'critical'
                          if (rankFilter === 'overall') {
                            return isDeclining ? t('dashboard.economicDecline') : t('dashboard.infrastructureStable')
                          }
                          const filter = dimensionFilters.find((f) => f.id === rankFilter)
                          const dimLabel = filter ? t(filter.tKey) : t('dashboard.sectorDecline')
                          const statusWord = isDeclining ? t('common.declining') : t('common.stable')
                          return `${dimLabel} ${statusWord.toLowerCase()}`
                        })()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-surface-100 px-4 py-3 dark:border-surface-800">
            <button
              type="button"
              onClick={() => setShowFullRankings(!showFullRankings)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {showFullRankings ? t('dashboard.showTopBottom') : t('dashboard.showAll')}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Section 6 — Recent Decisions */}
      <motion.section
        custom={6}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              {t('dashboard.recentDecisions')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/decisions')}
            className="gap-1 text-xs"
          >
            {t('common.viewAll')} <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {decisions.map((decision, i) => {
            const config = statusConfig[decision.status]
            const province = getProvinceByCode(decision.targetProvince)
            return (
              <motion.div
                key={decision.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                onClick={() => navigate('/decisions')}
                className="group w-72 shrink-0 cursor-pointer rounded-2xl border border-surface-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-800/50 dark:bg-surface-900/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={config.variant} size="sm" dot>
                    {t('status.' + decision.status)}
                  </Badge>
                  <span className="flex items-center gap-1 text-2xs text-surface-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(decision.createdAt)}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-surface-900 dark:text-white line-clamp-2">
                  {decision.title}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  {province && (
                    <Badge variant="default" size="sm">
                      {province.name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 text-2xs text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1">
                      {t('common.priorityScore')} <span className="font-bold text-surface-700 dark:text-surface-300">{decision.priorityScore}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {t('common.confidenceScore')} <span className="font-bold text-surface-700 dark:text-surface-300">{Math.round(decision.confidence * 100)}%</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>
    </div>
  )
}
