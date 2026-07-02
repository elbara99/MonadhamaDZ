import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Users, TrendingUp, AlertTriangle, Activity, MapPin, BarChart3,
  ArrowUpRight, ChevronRight, Search, AlertCircle, FileText,
  Target, Layers, Clock, Building2, Shield, DollarSign,
  BrainCircuit, ChevronUp, ChevronDown, Minus, Hexagon,
} from 'lucide-react'
import { cn, formatNumber, getScoreColor, timeAgo } from '@/lib/utils'
import { alerts, insights, decisions, getProvinceByCode } from '@/lib/mock-data'
import { useProvinces } from '@/hooks/use-provinces'
import { AlgeriaMap } from '@/components/map/algeria-map'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchStore } from '@/hooks/use-search'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

const alertDot: Record<string, string> = {
  critical: 'bg-danger-500',
  warning: 'bg-warning-500',
  info: 'bg-sky-500',
}

const alertBorder: Record<string, string> = {
  critical: 'border-r-danger-500',
  warning: 'border-r-warning-500',
  info: 'border-r-sky-500',
}

const statusConfig: Record<string, { variant: 'warning' | 'primary' | 'danger' | 'success' }> = {
  pending: { variant: 'warning' },
  accepted: { variant: 'primary' },
  rejected: { variant: 'danger' },
  implemented: { variant: 'success' },
}

const insightIcons: Record<string, typeof AlertTriangle> = {
  risk: AlertTriangle,
  trend: TrendingUp,
  anomaly: Activity,
  opportunity: Target,
}

const insightColors: Record<string, string> = {
  trend: 'text-emerald-600 bg-emerald-50',
  risk: 'text-danger-600 bg-danger-50',
  opportunity: 'text-accent-600 bg-accent-50',
  anomaly: 'text-warning-600 bg-warning-50',
}

const dimensionFilters = [
  { id: 'overall', labelKey: 'common.overall' },
  { id: 'health', labelKey: 'common.health' },
  { id: 'education', labelKey: 'common.education' },
  { id: 'economy', labelKey: 'common.economy' },
  { id: 'infrastructure', labelKey: 'common.infrastructure' },
  { id: 'security', labelKey: 'common.security' },
  { id: 'employment', labelKey: 'common.employment' },
]

const legendItems = [
  { label: 'scores.excellent', color: 'bg-score-excellent' },
  { label: 'scores.good', color: 'bg-score-good' },
  { label: 'scores.fair', color: 'bg-score-fair' },
  { label: 'scores.warning', color: 'bg-score-warning' },
  { label: 'scores.critical', color: 'bg-score-critical' },
]

const KPIS = [
  { key: 'provinces', icon: Building2, value: '58', subKey: 'dashboard.provincesCount', trend: '', gold: false, sparkline: [] },
  { key: 'population', icon: Users, value: '46.2M', subKey: 'dashboard.perCapita', trend: '+1.8%', gold: false, sparkline: [40, 42, 43, 44, 45, 46.2] },
  { key: 'gdp', icon: DollarSign, value: '34.8T DZD', subKey: 'dashboard.perCapita', trend: '+3.2%', gold: false, sparkline: [28, 30, 32, 33, 34, 34.8] },
  { key: 'nationalScore', icon: Hexagon, value: '72.4', subKey: 'dashboard.avgCompositeScore', trend: '+0.8', gold: true, sparkline: [68, 69, 70, 71.5, 72, 72.4] },
  { key: 'safeProvinces', icon: Shield, value: '55', subKey: 'dashboard.provincesInAlert', trend: '94.8%', gold: false, sparkline: [50, 52, 51, 53, 54, 55] },
  { key: 'dataSources', icon: BarChart3, value: '1254', subKey: 'dashboard.dataSourcesActive', trend: '81%', gold: false, sparkline: [800, 950, 1050, 1100, 1200, 1254] },
]

const Sparkline = ({ data, colorClass, thickness = 3 }: { data: number[], colorClass: string, thickness?: number }) => {
  if (!data || data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="-5 -5 110 110" className="w-16 h-8 overflow-visible" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        className={colorClass}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const searchStore = useSearchStore()
  const [rankFilter, setRankFilter] = useState('overall')
  const [showAllRankings, setShowAllRankings] = useState(false)
  const { data: provincesData, isLoading, error } = useProvinces({ page_size: 100 })

  const ranked = useMemo(() => {
    if (!provincesData?.items?.length) return []
    return [...provincesData.items]
      .map((p) => {
        const mock = getProvinceByCode(p.code.toUpperCase())
        const score = rankFilter === 'overall'
          ? (mock?.compositeScore ?? 50)
          : (mock?.scores[rankFilter] ?? 50)
        return {
          code: p.code.toUpperCase(),
          name: i18n.language === 'ar' ? (p.name_ar || p.name_fr || p.code) : (p.name_fr || p.code),
          population: p.population,
          score,
          change: Math.round((Math.random() - 0.4) * 6 - 2),
        }
      })
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }, [provincesData, rankFilter, i18n.language])

  const top5 = ranked.slice(0, 5)
  const display = showAllRankings ? ranked : top5

  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 }
      return order[a.type] - order[b.type]
    }),
    [],
  )

  const trendIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
    if (change < 0) return <ChevronDown className="h-3.5 w-3.5 text-danger-500" />
    return <Minus className="h-3.5 w-3.5 text-surface-300" />
  }

  const criticalAlertCount = alerts.filter((a) => a.type === 'critical').length

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="page-container">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('dashboard.title')}</h1>
            <p className="page-subtitle">{t('dashboard.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => searchStore.open()}
            className="form-input flex h-10 w-72 items-center gap-2 px-4 text-surface-400"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t('dashboard.quickSearch')}</span>
            <kbd>⌘K</kbd>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards — 3 columns, premium accent bar */}
      <motion.div {...fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {KPIS.map((kpi, i) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.05 + i * 0.04, ease: [0.4, 0, 0.2, 1] } }}
            className={cn(
              kpi.gold ? 'border-t-2 border-t-gold-500' : 'border-t-2 border-t-surface-200',
              'rounded-lg bg-white border border-surface-200 p-5 shadow-sm transition-all hover:border-surface-300'
            )}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-surface-500 uppercase tracking-wider">{t(`dashboard.${kpi.key}`)}</p>
                <kpi.icon className={cn('h-4 w-4', kpi.gold ? 'text-gold-500' : 'text-surface-400')} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={cn('text-3xl font-semibold tracking-tight', kpi.gold ? 'text-gold-600' : 'text-navy-900')}>{kpi.value}</p>
                  {kpi.trend ? (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-medium',
                        kpi.trend.includes('+') ? 'text-emerald-600' : 'text-danger-600'
                      )}>
                        {kpi.trend.includes('+') ? <ArrowUpRight className="h-3 w-3" /> : null}
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-surface-500">{t(kpi.subKey)}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-surface-500">{t(kpi.subKey)}</div>
                  )}
                </div>
                {kpi.sparkline && kpi.sparkline.length > 0 && (
                  <div className="mb-2">
                    <Sparkline 
                      data={kpi.sparkline} 
                      colorClass={kpi.gold ? 'text-gold-400 opacity-60' : (kpi.trend?.includes('-') ? 'text-danger-400 opacity-50' : 'text-emerald-600 opacity-30')}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Map + Alerts — wider map */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.animate.transition, delay: 0.15 }}
          className="lg:col-span-4"
        >
          <div className="card-standard">
            <div className="section-header">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-algeria-500" />
                <span className="section-title">{t('dashboard.nationalPerformanceMap')}</span>
              </div>
              <div className="hidden items-center gap-4 text-tiny sm:flex">
                {legendItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className={cn('h-2.5 w-2.5 rounded-sm', item.color)} />
                    <span className="text-surface-400">{t(item.label)}</span>
                  </div>
                ))}
              </div>
            </div>
            {isLoading ? (
              <div className="p-6">
                <div className="skeleton h-[520px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="h-[520px]">
                <AlgeriaMap onProvinceSelect={(code) => navigate(`/provinces/${code.toLowerCase()}`)} />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.animate.transition, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="card-standard h-full flex flex-col">
            <div className="section-header">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning-500" />
                <span className="section-title">{t('dashboard.alerts')}</span>
                {criticalAlertCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-micro font-bold text-white">
                    {criticalAlertCount}
                  </span>
                )}
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest text-algeria-600 hover:text-algeria-500">
                {t('common.viewAll')}
              </button>
            </div>
            {sortedAlerts.length === 0 ? (
              <div className="empty-state flex-1">
                <AlertCircle className="empty-state-icon h-10 w-10" />
                <p className="empty-state-title">{t('dashboard.noAlerts')}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 px-3 pb-3">
                {sortedAlerts.slice(0, 8).map((alert) => {
                  const province = getProvinceByCode(alert.provinceCode)
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'rounded-xl border-r-[3px] px-3.5 py-3 transition-colors hover:bg-surface-50',
                        'bg-white border border-surface-100',
                        alertBorder[alert.type],
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', alertDot[alert.type])} />
                        <h3 className="truncate text-sm font-semibold text-navy-900">{alert.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-surface-500 leading-relaxed">{alert.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {province && <Badge variant="default" size="sm">{province.nameAr}</Badge>}
                        <span className="text-tiny text-surface-400">{timeAgo(alert.timestamp, t)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.animate.transition, delay: 0.25 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="h-5 w-5 text-algeria-500" />
            <h2 className="text-lg font-bold tracking-tight text-navy-900">{t('dashboard.aiGeneratedInsights')}</h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            {t('common.viewAll')} <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        {insights.length === 0 ? (
          <div className="empty-state">
            <BrainCircuit className="empty-state-icon h-12 w-12" />
            <p className="empty-state-title">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {insights.map((insight, i) => {
              const province = getProvinceByCode(insight.provinceCode)
              const Icon = insightIcons[insight.type]
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.25 + i * 0.05, ease: [0.4, 0, 0.2, 1] } }}
                  className="insight-card"
                >
                  <div className={cn('mb-3 inline-flex rounded-btn p-2.5', insightColors[insight.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-navy-900">{insight.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-surface-500">{insight.description}</p>
                  {province && (
                    <div className="mt-3">
                      <Badge variant="default" size="sm">{province.nameAr}</Badge>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Province Rankings */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.animate.transition, delay: 0.3 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-algeria-500" />
            <h2 className="text-lg font-bold tracking-tight text-navy-900">{t('dashboard.provinceRankings')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-surface-400">{t('common.filter')}</span>
            <div className="flex gap-1">
              {dimensionFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRankFilter(f.id)}
                  className={cn(
                    'rounded-btn px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                    rankFilter === f.id
                      ? 'bg-algeria-500 text-white'
                      : 'text-surface-400 hover:bg-surface-50 hover:text-surface-600',
                  )}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-standard p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-5 w-8 rounded" />
                <div className="skeleton h-5 flex-1 rounded" />
                <div className="skeleton h-5 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card-standard p-10">
            <div className="empty-state">
              <AlertCircle className="empty-state-icon h-12 w-12" />
              <p className="empty-state-title">{t('common.error')}</p>
              <p className="empty-state-desc">{error.message}</p>
            </div>
          </div>
        ) : ranked.length === 0 ? (
          <div className="card-standard p-10">
            <div className="empty-state">
              <Layers className="empty-state-icon h-12 w-12" />
              <p className="empty-state-title">{t('common.noData')}</p>
              <p className="empty-state-desc">{t('common.noResultsDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="card-standard">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16">{t('dashboard.rank')}</th>
                    <th>{t('dashboard.province')}</th>
                    <th className="text-right">{t('dashboard.score')}</th>
                    <th className="text-right hidden sm:table-cell">{t('dashboard.change')}</th>
                    <th className="text-right hidden md:table-cell">{t('common.population')}</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((p, idx) => (
                    <tr
                      key={p.code}
                      onClick={() => navigate(`/provinces/${p.code.toLowerCase()}`)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'flex h-7 w-7 items-center justify-center rounded text-xs font-bold',
                            p.rank <= 3
                              ? 'bg-algeria-50 text-algeria-700'
                              : 'text-surface-400',
                          )}>
                            {p.rank}
                          </span>
                          {!showAllRankings && idx === 4 && ranked.length > 5 && (
                            <span className="text-mini text-surface-300">...</span>
                          )}
                        </div>
                      </td>
                      <td className="font-medium text-navy-900">{p.name}</td>
                      <td className="text-right">
                        <span className={cn('font-semibold tabular-nums', getScoreColor(p.score))}>{p.score}</span>
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        <div className="inline-flex items-center gap-1">
                          {trendIcon(p.change)}
                          <span className={cn(
                            'text-tiny font-semibold tabular-nums',
                            p.change > 0 ? 'text-emerald-600' : p.change < 0 ? 'text-danger-600' : 'text-surface-400',
                          )}>
                            {p.change > 0 ? `+${p.change}` : p.change}
                          </span>
                        </div>
                      </td>
                      <td className="text-right hidden md:table-cell text-surface-400 tabular-nums">
                        {formatNumber(p.population)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ranked.length > 5 && (
              <div className="border-t border-surface-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowAllRankings(!showAllRankings)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-algeria-600 hover:text-algeria-500"
                >
                  <Layers className="h-3 w-3" />
                  {showAllRankings ? t('dashboard.showTopFive') : t('dashboard.showAll')}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Strategic Decisions */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.animate.transition, delay: 0.35 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-algeria-500" />
            <h2 className="text-lg font-bold tracking-tight text-navy-900">{t('dashboard.recentDecisions')}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/decisions')}
            className="gap-1.5 text-xs"
          >
            {t('common.viewAll')} <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        {decisions.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon h-12 w-12" />
            <p className="empty-state-title">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar">
            {decisions.map((decision, i) => {
              const config = statusConfig[decision.status]
              const province = getProvinceByCode(decision.targetProvince)
              return (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.35 + i * 0.05, ease: [0.4, 0, 0.2, 1] } }}
                  onClick={() => navigate('/decisions')}
                  className="card-standard w-72 shrink-0 cursor-pointer p-6 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={config.variant} size="sm" dot>
                      {t(`status.${decision.status}`)}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-tiny text-surface-400">
                      <Clock className="h-3 w-3" />
                      {timeAgo(decision.createdAt, t)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug text-navy-900 line-clamp-2">
                    {decision.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    {province && <Badge variant="default" size="sm">{province.nameAr}</Badge>}
                    <div className="flex items-center gap-4 text-tiny text-surface-400">
                      <span>
                        {t('common.priority')}{' '}
                        <span className="font-semibold text-navy-700">{decision.priorityScore}</span>
                      </span>
                      <span>
                        {t('common.confidenceScore')}{' '}
                        <span className="font-semibold text-navy-700">{Math.round(decision.confidence * 100)}%</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
