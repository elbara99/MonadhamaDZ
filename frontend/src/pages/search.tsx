'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Mic,
  SlidersHorizontal,
  Bot,
  FileText,
  ChevronRight,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  Sparkles,
} from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'
import { provinces, getProvinceByCode, decisions } from '@/lib/mock-data'
import type { Province } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { BarChart } from '@/components/charts/bar-chart'

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

const mockResults = {
  answer:
    'بناءً على أحدث بيانات عام 2025 من وزارة الصحة والإحصاء الوطني، تظهر ولايات تمنراست وإليزي وجانت فجوات حرجة في البنية التحتية للرعاية الصحية. يبلغ متوسط هذه الولايات الجنوبية 0.6 سرير مستشفى لكل 1,000 نسمة مقارنة بالمتوسط الوطني البالغ 2.1. بالإضافة إلى معدلات نمو سكاني تتجاوز 3% سنوياً، يُوصى باستثمار فوري لمنع أزمة صحية.',
  keyFindings: [
    'تمنراست لديها 0.8 سرير لكل 1,000 نسمة مقابل متوسط وطني 2.1',
    'نسبة إشغال العناية المركزة في المناطق الجنوبية تبلغ 94% — أعلى بكثير من الحدود الآمنة',
    'عدد السكان في الولايات المتضررة ينمو بنسبة 3.2% سنوياً',
    'التمويل الطارئ الموصى به: 4.5 مليار دينار جزائري لبناء مستشفيات جديدة',
  ],
  sources: [
    'وزارة الصحة — التقرير السنوي 2025',
    'بيانات الإحصاء الوطني 2025',
    'مؤشر الوصول للرعاية الصحية - منظمة الصحة العالمية — التحليل الإقليمي للجزائر',
  ],
  confidenceScore: 87,
  relevantProvinces: ['DZ-11', 'DZ-33', 'DZ-56'],
}

const unemploymentData = [
  { label: '2019', value: 11.4 },
  { label: '2020', value: 13.8 },
  { label: '2021', value: 14.2 },
  { label: '2022', value: 12.9 },
  { label: '2023', value: 11.8 },
  { label: '2024', value: 10.5 },
  { label: '2025', value: 9.7 },
]

export default function SearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedQueries = [
    t('search.suggestedQuery1'),
    t('search.suggestedQuery2'),
    t('search.suggestedQuery3'),
    t('search.suggestedQuery4'),
    t('search.suggestedQuery5'),
  ]

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('time.justNow')
    if (mins < 60) return t('time.minutesAgo', { count: mins })
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return t('time.hoursAgo', { count: hrs })
    const days = Math.floor(hrs / 24)
    return t('time.daysAgo', { count: days })
  }

  useEffect(() => {
    if (hasSearched) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        setIsTyping(false)
        setShowResults(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSearched])

  function handleSearch(value?: string) {
    const searchValue = value || query
    if (!searchValue.trim()) return
    setQuery(searchValue)
    setHasSearched(true)
    setShowResults(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function handleSuggestedQuery(q: string) {
    setQuery(q)
    handleSearch(q)
  }

  function handleReset() {
    setQuery('')
    setHasSearched(false)
    setShowResults(false)
    setIsTyping(false)
    inputRef.current?.focus()
  }

  const relevantProvinces = mockResults.relevantProvinces
    .map((code) => getProvinceByCode(code))
    .filter(Boolean) as Province[]

  return (
    <div className="mx-auto max-w-[900px] pb-16">
      {/* Search Input */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className={cn(
          'relative transition-all duration-500',
          hasSearched ? 'mt-2' : 'mt-16 sm:mt-24',
        )}
      >
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-surface-200/70 bg-white shadow-sm transition-all focus-within:border-primary-400 focus-within:shadow-glow dark:border-surface-800/50 dark:bg-surface-900/80 dark:focus-within:border-primary-500/50',
            hasSearched && 'shadow-card',
          )}
        >
          <div className="flex items-center px-4 py-3.5">
            <Search className="h-5 w-5 shrink-0 text-surface-400 dark:text-surface-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="ml-3 flex-1 bg-transparent text-base text-surface-900 placeholder-surface-400 outline-none dark:text-surface-100 dark:placeholder-surface-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                aria-label={t('search.voiceSearch')}
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                aria-label={t('search.filters')}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggested Queries */}
      {!hasSearched && (
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mt-8"
        >
          <p className="mb-3 text-center text-xs font-medium text-surface-500 dark:text-surface-400">
            {t('search.suggestedQueries')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedQueries.map((q, i) => (
              <motion.button
                key={q}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                type="button"
                onClick={() => handleSuggestedQuery(q)}
                className="rounded-xl border border-surface-200/60 bg-white/60 px-4 py-2.5 text-xs font-medium text-surface-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-700 dark:border-surface-800/50 dark:bg-surface-900/40 dark:text-surface-400 dark:hover:border-primary-700/50 dark:hover:bg-primary-950/20 dark:hover:text-primary-300"
              >
                <Sparkles className="mr-1.5 inline-block h-3 w-3 text-primary-400" />
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasSearched && !showResults && isTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="animate-pulse space-y-4 rounded-2xl border border-surface-200/70 bg-white/60 p-6 dark:border-surface-800/50 dark:bg-surface-900/40">
              <div className="h-4 w-3/4 rounded-lg bg-surface-200 dark:bg-surface-800" />
              <div className="h-4 w-1/2 rounded-lg bg-surface-200 dark:bg-surface-800" />
              <div className="h-4 w-5/6 rounded-lg bg-surface-200 dark:bg-surface-800" />
              <div className="h-4 w-2/3 rounded-lg bg-surface-200 dark:bg-surface-800" />
            </div>
          </motion.div>
        )}

        {hasSearched && showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-8 space-y-6"
          >
            {/* AI Generated Response */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-900/60"
            >
              <div className="border-b border-surface-100 px-6 py-4 dark:border-surface-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-surface-900 dark:text-white">
                    {t('search.aiGeneratedResponse')}
                  </span>
                  <Badge variant="primary" size="sm" className="ml-auto">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {t('search.confidence', { score: mockResults.confidenceScore })}
                  </Badge>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                  {mockResults.answer}
                </p>

                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    {t('search.keyFindings')}
                  </p>
                  {mockResults.keyFindings.map((finding, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg bg-surface-50 px-4 py-2.5 dark:bg-surface-800/40"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="text-xs text-surface-600 dark:text-surface-400">
                        {finding}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {mockResults.sources.map((source, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-1.5 text-2xs text-surface-500 dark:bg-surface-800/40 dark:text-surface-400"
                    >
                      <FileText className="h-3 w-3" />
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Province Cards */}
            {relevantProvinces.length > 0 && (
              <motion.section
                custom={1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
              >
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
                    {t('search.relatedProvinces')}
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {relevantProvinces.map((province, i) => (
                    <motion.div
                      key={province.code}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      className="group cursor-pointer rounded-xl border border-surface-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-800/50 dark:bg-surface-900/60"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="default" size="sm">{province.code}</Badge>
                        <span className={cn('text-lg font-bold', getScoreColor(province.compositeScore))}>
                          {province.compositeScore}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-surface-900 dark:text-white">
                        {province.name}
                      </h3>
                      <p className="mt-1 text-2xs text-surface-500 dark:text-surface-400">
                        {t('search.pop')}: {province.population.toLocaleString()} &middot; {t('search.density')}: {province.density}/km²
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-2xs text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-primary-400">
                        {t('search.viewDetails')} <ChevronRight className="h-3 w-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Chart */}
            <motion.section
              custom={2}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-900/60">
                <div className="border-b border-surface-100 px-6 py-4 dark:border-surface-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-500" />
                    <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
                      {t('charts.unemploymentTrend')}
                    </h2>
                    <span className="ml-auto text-2xs text-surface-400">{t('charts.source')}: {t('search.unemploymentSource')}</span>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <BarChart
                    data={unemploymentData.map((d) => ({ label: d.label, value: d.value }))}
                    height={220}
                    layout="horizontal"
                  />
                </div>
              </div>
            </motion.section>

            {/* Data Table */}
            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-900/60">
                <div className="border-b border-surface-100 px-6 py-4 dark:border-surface-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary-500" />
                    <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
                      {t('search.relatedDecisions')}
                    </h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-100 dark:border-surface-800">
                        <th className="px-6 py-3 text-left text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                          {t('common.title')}
                        </th>
                        <th className="px-6 py-3 text-left text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                          {t('common.province')}
                        </th>
                        <th className="px-6 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                          {t('search.priority')}
                        </th>
                        <th className="px-6 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                          {t('search.status')}
                        </th>
                        <th className="px-6 py-3 text-right text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                          {t('search.date')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisions.slice(0, 3).map((dec, i) => {
                        const province = getProvinceByCode(dec.targetProvince)
                        const statusColors: Record<string, string> = {
                          pending: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
                          accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                          rejected: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
                          implemented: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
                        }
                        return (
                          <tr
                            key={dec.id}
                            className="border-b border-surface-50 transition-colors last:border-0 hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-800/30"
                          >
                            <td className="px-6 py-3.5 font-medium text-surface-900 dark:text-white">
                              {dec.title}
                            </td>
                            <td className="px-6 py-3.5 text-xs text-surface-500 dark:text-surface-400">
                              {province?.name ?? dec.targetProvince}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="font-bold text-surface-700 dark:text-surface-300">
                                {dec.priorityScore}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className={cn('inline-block rounded-full px-2 py-0.5 text-2xs font-medium', statusColors[dec.status])}>
                                {t('status.' + dec.status)}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right text-2xs text-surface-400">
                              {timeAgo(dec.createdAt)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>

            {/* New Search */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="pt-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
                <span className="text-2xs font-medium text-surface-400">{t('search.askFollowUp')}</span>
                <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-surface-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl transition-all focus-within:border-primary-400 focus-within:shadow-glow dark:border-surface-800/50 dark:bg-surface-900/60 dark:focus-within:border-primary-500/50">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="flex-1 bg-transparent text-sm text-surface-900 placeholder-surface-400 outline-none dark:text-surface-100 dark:placeholder-surface-500"
                />
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white transition-colors hover:bg-primary-600"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300"
                >
                  {t('search.startNewSearch')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
