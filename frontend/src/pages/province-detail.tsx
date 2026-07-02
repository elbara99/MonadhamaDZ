'use client'

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronsDown,
  Activity,
  Heart,
  Book,
  Briefcase,
  Building2,
  Shield,
  Leaf,
  Truck,
  Droplets,
  Wheat,
  Compass,
  Banknote,
  School,
  Route,
  Hospital,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { cn, formatNumber, getScoreColor, getScoreBg, getScoreLabel } from '@/lib/utils'
import {
  provinces as mockProvinces,
  dimensionKeys,
  getDimensionLabel,
  getProvinceByCode,
} from '@/lib/mock-data'
import type { Province, DimensionKey } from '@/lib/mock-data'
import { useProvince, useProvinces } from '@/hooks/use-provinces'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { PriorityScore } from '@/components/scores/priority-score'
import { DimensionCard } from '@/components/scores/dimension-card'
import { RadarChart } from '@/components/charts/radar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { AlgeriaMap } from '@/components/map/algeria-map'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

const dimensionIconsMap: Record<string, React.ReactNode> = {
  health: <Heart className="h-4 w-4" />,
  education: <Book className="h-4 w-4" />,
  economy: <TrendingUp className="h-4 w-4" />,
  employment: <Briefcase className="h-4 w-4" />,
  investment: <Banknote className="h-4 w-4" />,
  infrastructure: <Building2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  environment: <Leaf className="h-4 w-4" />,
  transportation: <Truck className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  agriculture: <Wheat className="h-4 w-4" />,
  tourism: <Compass className="h-4 w-4" />,
}

const trendIconMap: Record<string, React.ReactNode> = {
  improving: <TrendingUp className="h-3.5 w-3.5" />,
  stable: <ArrowRight className="h-3.5 w-3.5" />,
  declining: <TrendingDown className="h-3.5 w-3.5" />,
  critical: <ChevronsDown className="h-3.5 w-3.5" />,
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function getScoreGradientBg(score: number): string {
  if (score >= 90) return 'from-cyan-500/10 via-cyan-500/5 to-transparent'
  if (score >= 75) return 'from-emerald-500/10 via-emerald-500/5 to-transparent'
  if (score >= 60) return 'from-yellow-500/10 via-yellow-500/5 to-transparent'
  if (score >= 40) return 'from-orange-500/10 via-orange-500/5 to-transparent'
  return 'from-red-500/10 via-red-500/5 to-transparent'
}

const indicatorFormat: Record<string, 'percent' | 'number'> = {
  populationGrowth: 'percent',
  unemploymentRate: 'percent',
  literacyRate: 'percent',
  povertyRate: 'percent',
  internetAccess: 'percent',
  cleanWaterAccess: 'percent',
  lifeExpectancy: 'number',
  hospitalBedsPer1000: 'number',
  doctorsPer1000: 'number',
}

const nationalAverages: Record<string, number> = {
  populationGrowth: 1.8,
  unemploymentRate: 14.2,
  literacyRate: 81.4,
  povertyRate: 14.8,
  internetAccess: 63.0,
  cleanWaterAccess: 84.0,
  lifeExpectancy: 76.5,
  hospitalBedsPer1000: 2.1,
  doctorsPer1000: 1.3,
}

function generateTimeline(province: Province, t: (key: string, opts?: Record<string, unknown>) => string) {
  const dims = dimensionKeys.filter(() => Math.random() > 0.6).slice(0, 3)
  const events: { icon: React.ReactNode; desc: string; date: string; color: string }[] = []

  for (const d of dims) {
    const old = Math.round((province.scores[d] ?? 50) + (Math.random() - 0.5) * 20)
    const isUp = (province.scores[d] ?? 50) >= old
    events.push({
      icon: isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />,
      desc: `${getDimensionLabel(d)}: ${isUp ? t('provinceDetail.scoreImproved') : t('provinceDetail.scoreDeclined')} (${old} → ${province.scores[d]})`,
      date: `2026-0${Math.floor(Math.random() * 5) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      color: isUp ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    })
  }

  events.push({
    icon: <Hospital className="h-3.5 w-3.5" />,
    desc: `+${Math.floor(Math.random() * 100 + 20)} ${t('provinceDetail.beds')}`,
    date: `2026-0${Math.floor(Math.random() * 5) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  })

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

function generateMockEntities(province: Province) {
  const hospitalTypes = ['المركزي', 'العام', 'الإقليمي', 'التخصصي', 'الجامعي', 'العسكري']
  const schoolTypes = ['الثانوية', 'الابتدائية', 'الابتدائية', 'المتوسطة', 'المهنية', 'التحضيرية']
  const directions = ['المركزي', 'الشمالي', 'الجنوبي', 'الشرقي', 'الغربي', 'الجديد']
  const roadConditions: ('Good' | 'Fair' | 'Poor' | 'Under Construction' | 'Good')[] = ['Good', 'Fair', 'Poor', 'Under Construction', 'Good']
  const roadTypes: ('National' | 'Regional' | 'Highway' | 'Regional')[] = ['National', 'National', 'Regional', 'Highway', 'Regional']
  const projectNames = ['معالجة المياه', 'تجديد المدارس', 'توسعة الطرق', 'جناح المستشفى', 'محطة الطاقة الشمسية']
  const projectStatuses: ('In Progress' | 'Planning' | 'Completed' | 'Approved')[] = ['In Progress', 'Planning', 'Completed', 'In Progress', 'Approved']

  const hospitals = Array.from({ length: 6 }, (_, i) => ({
    name: `مستشفى ${province.name} ${hospitalTypes[i]}`,
    beds: Math.floor(Math.random() * 400 + 50),
    staff: Math.floor(Math.random() * 200 + 30),
    type: ['Public', 'Public', 'Public', 'Private', 'University', 'Military'][i],
  }))

  const schools = Array.from({ length: 6 }, (_, i) => ({
    name: `مدرسة ${schoolTypes[i]} ${province.name} ${directions[i]}`,
    students: Math.floor(Math.random() * 1200 + 200),
    teachers: Math.floor(Math.random() * 60 + 10),
    level: ['Secondary', 'Primary', 'Primary', 'Secondary', 'Vocational', 'Preparatory'][i],
  }))

  const roads = Array.from({ length: 5 }, (_, i) => ({
    name: `الطريق رقم ${String(Math.floor(Math.random() * 100) + 1)} — ${province.name}`,
    length: Math.floor(Math.random() * 80 + 10),
    condition: roadConditions[i],
    type: roadTypes[i],
  }))

  const projects = Array.from({ length: 5 }, (_, i) => ({
    name: `${projectNames[i]} — ${province.name}`,
    budget: Math.floor(Math.random() * 500 + 50),
    progress: Math.floor(Math.random() * 100),
    status: projectStatuses[i],
  }))

  return { hospitals, schools, roads, projects }
}

function getIndicatorValue(province: Province, key: string): string {
  const val = province.indicators[key]
  if (val == null) return '—'
  if (indicatorFormat[key] === 'percent') return val.toFixed(1) + '%'
  return val.toFixed(1)
}

function IndicatorMiniBar({ value, average }: { value: number; average: number }) {
  const isAbove = value >= average
  const pct = Math.min((value / (average * 2)) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-navy-700">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            isAbove ? 'bg-emerald-500' : 'bg-amber-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'text-2xs font-medium tabular-nums',
          isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        )}
      >
        {isAbove ? '+' : ''}{(value - average).toFixed(1)}
      </span>
    </div>
  )
}

function generateScoreTrend(): { date: string; value: number }[] {
  const years = ['2022', '2023', '2024', '2025', '2026']
  let val = 45 + Math.random() * 30
  return years.map((y) => {
    val += (Math.random() - 0.4) * 8
    val = Math.max(20, Math.min(95, val))
    return { date: y, value: Math.round(val) }
  })
}

export default function ProvinceDetailPage() {
  const { t } = useTranslation()
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const provinceCode = code?.toUpperCase() ?? ''

  const { data: apiProvince, isLoading, isError, error } = useProvince(provinceCode)
  const { data: allProvinces } = useProvinces({ page_size: 100 })

  const mockProvince = getProvinceByCode(provinceCode)
  const province = mockProvince ?? null

  const [selectedDim, setSelectedDim] = useState<string | null>(null)
  const [aiRegenerating, setAiRegenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('hospitals')

  const timeline = useMemo(() => province ? generateTimeline(province, t) : [], [province, t])
  const entities = useMemo(() => province ? generateMockEntities(province) : null, [province])
  const scoreTrend = useMemo(() => generateScoreTrend(), [])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-8 pb-16 px-6 pt-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError && !province) {
    return (
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-navy-800">
          <AlertCircle className="h-8 w-8 text-danger-500" />
        </div>
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
          {t('common.error')}
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {(error as any)?.response?.data?.detail || t('provinceDetail.notFoundDesc', { code: provinceCode })}
        </p>
        <Button
          variant="ghost"
          className="mt-6 gap-2"
          onClick={() => navigate('/provinces')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('provinceDetail.backToProvinces')}
        </Button>
      </div>
    )
  }

  if (!province) {
    return (
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-navy-800">
          <MapPin className="h-8 w-8 text-surface-400" />
        </div>
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
          {t('provinceDetail.notFound')}
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {t('provinceDetail.notFoundDesc', { code: provinceCode })}
        </p>
        <Button
          variant="ghost"
          className="mt-6 gap-2"
          onClick={() => navigate('/provinces')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('provinceDetail.backToProvinces')}
        </Button>
      </div>
    )
  }

  const compositeColor = getScoreColor(province.compositeScore)
  const compositeLabel = getScoreLabel(province.compositeScore)

  const radarData = dimensionKeys.map((key) => ({
    dimension: getDimensionLabel(key),
    value: province.scores[key] ?? 0,
    fullMark: 100,
  }))

  const keyIndicators = [
    'populationGrowth',
    'unemploymentRate',
    'literacyRate',
    'povertyRate',
    'internetAccess',
    'cleanWaterAccess',
  ] as const

  const relatedTabs = [
    { id: 'hospitals', label: t('provinceDetail.hospitals'), icon: <Hospital className="h-4 w-4" /> },
    { id: 'schools', label: t('provinceDetail.schools'), icon: <School className="h-4 w-4" /> },
    { id: 'roads', label: t('provinceDetail.roads'), icon: <Route className="h-4 w-4" /> },
    { id: 'projects', label: t('provinceDetail.projects'), icon: <Activity className="h-4 w-4" /> },
  ]

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 pb-16 px-6 pt-8">
      {/* Back nav */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          type="button"
          onClick={() => navigate('/provinces')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('provinceDetail.backToProvinces')}
        </button>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        custom={0} initial="hidden" animate="visible" variants={sectionVariants}
        className={cn(
          'relative overflow-hidden rounded-3xl border border-surface-200/70 bg-gradient-to-br p-8 shadow-soft dark:border-navy-700/50',
          getScoreGradientBg(province.compositeScore),
        )}
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-algeria-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
                {province.name}
              </h1>
              <Badge variant="gold" size="sm">{province.code}</Badge>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-lg text-surface-500 dark:text-surface-400" dir="rtl">
                {province.nameAr}
              </span>
              <span className="text-surface-300 dark:text-surface-600">|</span>
              <span className="text-base text-surface-500 dark:text-surface-400">
                {province.nameFr}
              </span>
            </div>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              {t('provinceDetail.governor')}: <span className="font-medium text-surface-700 dark:text-surface-300">{province.governor}</span>
            </p>
          </div>

          <div className="shrink-0">
            <span className={cn('text-5xl font-bold tabular-nums', compositeColor)}>
              {province.compositeScore}
            </span>
            <p className={cn('text-sm font-semibold', compositeColor)}>
              {compositeLabel}
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label={t('provinceDetail.statCard.population')} value={formatNumber(province.population)} />
          <StatCard label={t('provinceDetail.statCard.area')} value={`${province.areaKm2.toLocaleString()} ${t('provinceDetail.km2')}`} />
          <StatCard label={t('provinceDetail.statCard.density')} value={`${province.density}${t('provinceDetail.perKm2')}`} />
          <StatCard label={t('provinceDetail.statCard.capital')} value={province.capital} />
        </div>
      </motion.section>

      {/* AI Summary Card */}
      <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card className="relative overflow-hidden border-algeria-500/20 bg-gradient-to-br from-algeria-50/50 to-white shadow-soft dark:border-algeria-900/30 dark:from-algeria-950/10 dark:to-navy-900">
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-algeria-500/10 blur-3xl" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-algeria-100 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-algeria-600 dark:text-algeria-400">
                    {t('provinceDetail.aiGeneratedAnalysis')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                  {province.name} shows a composite score of <strong>{province.compositeScore}</strong>, ranking it{' '}
                  {mockProvinces.filter((p) => p.compositeScore > province.compositeScore).length + 1}
                  {t('provinceDetail.outOf')} 58 provinces. The province demonstrates particular strength in{' '}
                  {[...dimensionKeys]
                    .sort((a, b) => (province.scores[b] ?? 0) - (province.scores[a] ?? 0))
                    .slice(0, 2)
                    .map((k) => getDimensionLabel(k))
                    .join(' and ')}
                  , while facing challenges in{' '}
                  {[...dimensionKeys]
                    .sort((a, b) => (province.scores[a] ?? 0) - (province.scores[b] ?? 0))
                    .slice(0, 2)
                    .map((k) => getDimensionLabel(k))
                    .join(' and ')}
                  . With a population of {formatNumber(province.population)} and an area of{' '}
                  {province.areaKm2.toLocaleString()} km², targeted investments in infrastructure and
                  human capital could significantly improve its overall development trajectory.
                </p>
                <p className="mt-2 text-2xs text-surface-400 dark:text-surface-500">
                  {t('provinceDetail.generatedFrom')} 12 {t('provinceDetail.dataSources')} &middot; {t('provinceDetail.updatedDaily')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={aiRegenerating}
                onClick={() => {
                  setAiRegenerating(true)
                  setTimeout(() => setAiRegenerating(false), 1200)
                }}
                className="shrink-0 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('common.regenerate')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Score Section */}
      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-navy-900 dark:text-white">
          {t('provinceDetail.priorityScoreAndDimensions')}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="flex items-center justify-center lg:col-span-1">
            <PriorityScore score={province.compositeScore} size="lg" />
          </div>
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {dimensionKeys.map((key) => {
                const score = province.scores[key] ?? 0
                return (
                  <DimensionCard
                    key={key}
                    dimension={getDimensionLabel(key)}
                    score={score}
                    trend={province.trends[key]}
                    icon={dimensionIconsMap[key]}
                    onClick={() => setSelectedDim(key)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Key Indicators Section */}
      <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-navy-900 dark:text-white">
          {t('provinceDetail.keyIndicators')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyIndicators.map((key) => {
            const value = province.indicators[key] ?? 0
            const avg = nationalAverages[key] ?? 50
            return (
              <Card key={key}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
                      {t(`provinceDetail.${key}`)}
                    </p>
                    <span
                      className={cn(
                        'text-xs font-semibold tabular-nums',
                        value >= avg ? 'text-emerald-500' : 'text-amber-500',
                      )}
                    >
                      {value >= avg ? t('common.aboveAvg') : t('common.belowAvg')}
                    </span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold text-navy-900 dark:text-white">
                    {getIndicatorValue(province, key)}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-2xs text-surface-400">
                      <span>{t('provinceDetail.nationalAvg')}: {avg.toFixed(1)}{indicatorFormat[key] === 'percent' ? '%' : ''}</span>
                      <span>{t('common.current')}: {value.toFixed(1)}{indicatorFormat[key] === 'percent' ? '%' : ''}</span>
                    </div>
                    <IndicatorMiniBar value={value} average={avg} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.section>

      {/* Charts Section */}
      <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-navy-900 dark:text-white">
          {t('provinceDetail.analytics')}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-algeria-500" />
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                  {t('charts.allDimensions')}
                </h3>
              </div>
              <RadarChart data={radarData} size={340} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-algeria-500" />
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                  {t('charts.compositeScoreTrend')}
                </h3>
              </div>
              <LineChart
                data={scoreTrend}
                height={280}
                showArea
                color="#336dff"
              />
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Recent Changes Section */}
      <motion.section custom={5} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-algeria-500" />
          <h2 className="text-lg font-bold tracking-tight text-navy-900 dark:text-white">
            {t('provinceDetail.recentChanges')}
          </h2>
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', event.color)}>
                      {event.icon}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="mt-1 h-full w-px bg-surface-200 dark:bg-navy-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <p className="text-sm font-medium text-navy-900 dark:text-white">
                      {event.desc}
                    </p>
                    <p className="mt-0.5 text-xs text-surface-400 dark:text-surface-500">
                      {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Related Entities */}
      <motion.section custom={6} initial="hidden" animate="visible" variants={sectionVariants}>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-navy-900 dark:text-white">
          {t('provinceDetail.relatedEntities')}
        </h2>
        <Card>
          <CardContent className="p-0">
            <Tabs
              tabs={relatedTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              style="underline"
            >
              {(tabId) => (
                <div className="p-5">
                  {tabId === 'hospitals' && entities && (
                    <div className="space-y-2">
                      {entities.hospitals.map((h, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-navy-900 dark:text-white">{h.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{t(`provinceDetail.${h.type.toLowerCase()}`, { defaultValue: h.type })} &middot; {h.beds} {t('provinceDetail.beds')} &middot; {h.staff} {t('provinceDetail.staff')}</p>
                          </div>
                          <Badge variant="gold" size="sm">{h.beds} {t('provinceDetail.beds')}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {tabId === 'schools' && entities && (
                    <div className="space-y-2">
                      {entities.schools.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-navy-900 dark:text-white">{s.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{t(`provinceDetail.schoolLevels.${s.level.toLowerCase()}`, { defaultValue: s.level })} &middot; {s.students} {t('provinceDetail.students')} &middot; {s.teachers} {t('provinceDetail.teachers')}</p>
                          </div>
                          <Badge variant="default" size="sm">{s.students} {t('provinceDetail.students')}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {tabId === 'roads' && entities && (
                    <div className="space-y-2">
                      {entities.roads.map((r, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-navy-900 dark:text-white">{r.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{t(`provinceDetail.${r.type.toLowerCase()}`, { defaultValue: r.type })} &middot; {r.length} {t('provinceDetail.km')} &middot; {t('provinceDetail.condition')}: {t(`provinceDetail.${r.condition === 'Under Construction' ? 'underConstruction' : r.condition.toLowerCase()}`, { defaultValue: r.condition })}</p>
                          </div>
                          <Badge variant={r.condition === 'Good' ? 'success' : r.condition === 'Poor' ? 'danger' : 'warning'} size="sm">{t(`provinceDetail.${r.condition === 'Under Construction' ? 'underConstruction' : r.condition.toLowerCase()}`, { defaultValue: r.condition })}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {tabId === 'projects' && entities && (
                    <div className="space-y-2">
                      {entities.projects.map((p, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-navy-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{t('provinceDetail.budget')}: ${p.budget}M &middot; {t('provinceDetail.progress')}: {p.progress}%</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-200 dark:bg-navy-700">
                              <div
                                className="h-full rounded-full bg-algeria-500"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                            <Badge
                              variant={p.status === 'Completed' ? 'success' : p.status === 'In Progress' ? 'primary' : p.status === 'Approved' ? 'info' : 'warning'}
                              size="sm"
                            >
                              {t(`provinceDetail.${p.status === 'In Progress' ? 'inProgress' : p.status.toLowerCase()}`, { defaultValue: p.status })}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </motion.section>

      {/* Map Section */}
      <motion.section custom={7} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="mb-5 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-algeria-500" />
          <h2 className="text-lg font-bold tracking-tight text-navy-900 dark:text-white">
            {t('provinceDetail.location')}
          </h2>
        </div>
        <div className="h-[320px] overflow-hidden rounded-2xl border border-surface-200/70 shadow-soft dark:border-navy-700/50">
          <AlgeriaMap
            selectedProvince={province.code}
            onProvinceSelect={() => {}}
            className="h-full"
          />
        </div>
      </motion.section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-200/50 bg-white/60 px-4 py-3 backdrop-blur-sm shadow-sm dark:border-navy-700/30 dark:bg-navy-900/40">
      <p className="text-2xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-navy-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}
