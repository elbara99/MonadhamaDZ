'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  MapPin,
  Target,
  Check,
  X,
  ArrowUpRight,
  Layers,
  BarChart3,
  CircleDot,
  Activity,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { decisions as allDecisions, getProvinceByCode } from '@/lib/mock-data'
import type { Decision } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n/i18n'

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

const statusConfig: Record<string, { color: string; dot: string }> = {
  pending: {
    color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300 border-warning-200 dark:border-warning-800',
    dot: 'bg-warning-500',
  },
  accepted: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  rejected: {
    color: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300 border-danger-200 dark:border-danger-800',
    dot: 'bg-danger-500',
  },
  implemented: {
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
}

const sectorColors: Record<string, string> = {
  Health: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Infrastructure: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Employment: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Water: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

function getPriorityColor(score: number): string {
  if (score >= 85) return 'text-danger-500'
  if (score >= 75) return 'text-warning-500'
  if (score >= 65) return 'text-gold-500'
  return 'text-surface-400'
}

function getPriorityBg(score: number): string {
  if (score >= 85) return 'bg-danger-50 dark:bg-danger-950/20'
  if (score >= 75) return 'bg-warning-50 dark:bg-warning-950/20'
  if (score >= 65) return 'bg-gold-50 dark:bg-gold-950/20'
  return 'bg-surface-50 dark:bg-navy-900/40'
}

function getConfidenceRingColor(confidence: number): string {
  if (confidence >= 0.8) return '#22c55e'
  if (confidence >= 0.6) return '#f59e0b'
  return '#ef4444'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return i18n.t('time.justNow')
  if (mins < 60) return i18n.t('time.minutesAgo', { count: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return i18n.t('time.hoursAgo', { count: hrs })
  const days = Math.floor(hrs / 24)
  if (days < 30) return i18n.t('time.daysAgo', { count: days })
  const months = Math.floor(days / 30)
  return i18n.t('time.monthsAgo', { count: months })
}

function ConfidenceRing({ value, size = 48 }: { value: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - value * circumference
  const color = getConfidenceRingColor(value)

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        className="text-surface-200 dark:text-navy-700"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

function DecisionCard({
  decision, index, isExpanded, onToggle, onAccept, onReject, onDefer,
  rejectReason, setRejectReason, showRejectInput, setShowRejectInput,
}: {
  decision: Decision; index: number; isExpanded: boolean; onToggle: () => void
  onAccept: () => void; onReject: () => void; onDefer: () => void
  rejectReason: string; setRejectReason: (val: string) => void
  showRejectInput: boolean; setShowRejectInput: (val: boolean) => void
}) {
  const { t } = useTranslation()
  const province = getProvinceByCode(decision.targetProvince)
  const config = statusConfig[decision.status]
  const sectorClass = sectorColors[decision.sector] ?? 'bg-surface-100 text-surface-700 dark:bg-navy-800 dark:text-surface-300'

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={cardVariants} layout
      className={cn(
        'overflow-hidden rounded-2xl border shadow-soft transition-all',
        isExpanded
          ? 'border-algeria-500/30 shadow-card-hover dark:border-algeria-700/40'
          : 'border-surface-200/70 dark:border-navy-700/50',
        'bg-white/80 backdrop-blur-xl dark:bg-navy-900/60',
      )}
    >
      <div className="cursor-pointer px-6 py-5" onClick={onToggle}>
        <div className="flex items-start gap-5">
          <div className={cn('flex shrink-0 flex-col items-center rounded-xl px-3 py-2.5', getPriorityBg(decision.priorityScore))}>
            <span className={cn('text-2xl font-bold leading-none', getPriorityColor(decision.priorityScore))}>
              {decision.priorityScore}
            </span>
            <span className="mt-0.5 text-2xs font-medium text-surface-500 dark:text-surface-400">
              {t('decisions.priority')}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                  {decision.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-surface-500 dark:text-surface-400 line-clamp-2">
                  {decision.summary}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden items-center gap-1.5 sm:flex">
                  <ConfidenceRing value={decision.confidence} size={40} />
                  <div className="text-2xs">
                    <p className="font-medium text-surface-700 dark:text-surface-300">{Math.round(decision.confidence * 100)}%</p>
                    <p className="text-surface-400">{t('decisions.confidence')}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-surface-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-surface-400" />
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-medium', config.color, 'border')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
                {t('status.' + decision.status)}
              </span>
              {province && (
                <Badge variant="default" size="sm">
                  <MapPin className="mr-1 h-2.5 w-2.5" />
                  {province.name}
                </Badge>
              )}
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-medium', sectorClass)}>
                {t('decisions.' + decision.sector.toLowerCase())}
              </span>
              <span className="text-2xs text-surface-400">
                {timeAgo(decision.createdAt)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {decision.evidence.map((source, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-surface-50 px-2 py-1 text-2xs text-surface-500 dark:bg-navy-800/40 dark:text-surface-400">
                  <FileText className="h-2.5 w-2.5" />
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>

        {decision.status === 'pending' && !isExpanded && (
          <div className="mt-4 flex items-center gap-2 border-t border-surface-100 pt-4 dark:border-navy-700">
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onAccept() }} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> {t('decisions.accept')}
            </Button>
            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setShowRejectInput(!showRejectInput) }} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> {t('decisions.reject')}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDefer() }} className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {t('decisions.defer')}
            </Button>
          </div>
        )}

        {showRejectInput && (
          <div className="mt-3 border-t border-surface-100 pt-3 dark:border-navy-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2">
              <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('decisions.reasonForRejection')}
                className="flex-1 rounded-xl border border-surface-300 bg-white px-3 py-2 text-xs text-navy-900 placeholder-surface-400 outline-none focus:border-danger-400 focus:ring-2 focus:ring-danger-500/20 dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:placeholder-surface-500"
              />
              <Button variant="danger" size="sm" onClick={onReject}>{t('decisions.confirmReject')}</Button>
            </div>
          </div>
        )}

        {(decision.status === 'accepted' || decision.status === 'implemented') && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {decision.status === 'implemented'
                ? t('decisions.implementedOn', { date: 'June 28, 2026', outcome: 'University capacity expanded by 2,000 seats' })
                : t('decisions.acceptedOn', { date: 'June 26, 2026' })}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-200/70 px-6 py-5 dark:border-navy-700/50">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    {t('decisions.fullRecommendation')}
                  </h4>
                  <div className="space-y-3 rounded-xl bg-surface-50/60 p-4 dark:bg-navy-800/30">
                    <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                      <strong className="text-navy-900 dark:text-white">{t('decisions.context')}</strong> {decision.summary}
                    </p>
                    <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                      {t('decisions.basedOnAnalysis')}{' '}
                      <strong className="text-navy-900 dark:text-white">{decision.title.toLowerCase()}</strong>.
                      {t('decisions.supportedBySources', { count: decision.evidence.length })} {t('decisions.aiConfidence', { percent: Math.round(decision.confidence * 100) })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    {t('decisions.expectedImpact')}
                  </h4>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-surface-200/60 bg-white/60 p-4 shadow-sm dark:border-navy-700/50 dark:bg-navy-900/40">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-2xs text-surface-500 dark:text-surface-400">{t('decisions.metric')}</p>
                          <p className="mt-0.5 text-xs font-semibold text-navy-900 dark:text-white">{t('decisions.healthcareIndex')}</p>
                        </div>
                        <div>
                          <p className="text-2xs text-surface-500 dark:text-surface-400">{t('decisions.current')}</p>
                          <p className="mt-0.5 text-xs font-semibold text-navy-900 dark:text-white">27.8</p>
                        </div>
                        <div>
                          <p className="text-2xs text-surface-500 dark:text-surface-400">{t('decisions.target')}</p>
                          <p className="mt-0.5 text-xs font-semibold text-emerald-500">45.0</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-2xs text-surface-400">
                          <span>{t('decisions.timeline')}: {t('decisions.twelveMonths')}</span>
                          <span>{t('decisions.improvement', { n: '17.2' })}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-surface-200 dark:bg-navy-700">
                          <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: '38%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    {t('decisions.alternativesConsidered')}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: t('decisions.gradualBudgetIncrease'), score: '62' },
                      { label: t('decisions.publicPrivatePartnership'), score: '71' },
                      { label: t('decisions.mobileHealthUnit'), score: '55' },
                    ].map((alt, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-surface-200/60 bg-white/60 px-4 py-3 shadow-sm dark:border-navy-700/50 dark:bg-navy-900/40">
                        <span className="text-xs text-surface-700 dark:text-surface-300">{alt.label}</span>
                        <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{t('decisions.score')}: {alt.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    {t('decisions.decisionHistory')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl border border-surface-200/60 bg-white/60 px-4 py-3 shadow-sm dark:border-navy-700/50 dark:bg-navy-900/40">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-navy-900 dark:text-white">{t('decisions.aiRecommendationGenerated')}</p>
                        <p className="text-2xs text-surface-400">{t('common.source')} — {timeAgo(decision.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-surface-200/60 bg-white/60 px-4 py-3 shadow-sm dark:border-navy-700/50 dark:bg-navy-900/40">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-navy-900 dark:text-white">{t('decisions.pendingReview')}</p>
                        <p className="text-2xs text-surface-400">{t('decisions.awaitingApproval')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function DecisionsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [localDecisions, setLocalDecisions] = useState(allDecisions)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [showRejectInputs, setShowRejectInputs] = useState<Record<string, boolean>>({})

  const filterTabs = [
    { id: 'all', label: t('decisions.filters.all') },
    { id: 'pending', label: t('decisions.filters.pending') },
    { id: 'accepted', label: t('decisions.filters.accepted') },
    { id: 'rejected', label: t('decisions.filters.rejected') },
    { id: 'implemented', label: t('decisions.filters.implemented') },
  ] as const

  const filteredDecisions = useMemo(() => {
    if (filter === 'all') return localDecisions
    return localDecisions.filter((d) => d.status === filter)
  }, [filter, localDecisions])

  const stats = useMemo(() => {
    const pending = localDecisions.filter((d) => d.status === 'pending').length
    const accepted = localDecisions.filter((d) => d.status === 'accepted').length
    const implemented = localDecisions.filter((d) => d.status === 'implemented').length
    const rejected = localDecisions.filter((d) => d.status === 'rejected').length
    return { pending, accepted, implemented, rejected, total: localDecisions.length }
  }, [localDecisions])

  function handleAccept(id: string) {
    setLocalDecisions((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'accepted' as const } : d),
    )
  }

  function handleReject(id: string) {
    setLocalDecisions((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'rejected' as const } : d),
    )
    setShowRejectInputs((prev) => ({ ...prev, [id]: false }))
  }

  function handleDefer(id: string) {
    setLocalDecisions((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'pending' as const } : d),
    )
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-4 lg:p-6 pb-12">
      <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
              {t('decisions.title')}
            </h1>
            <p className="text-sm text-surface-500">
              {t('decisions.description')}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('decisions.stats.pending'), value: stats.pending, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/20', icon: Clock },
            { label: t('decisions.stats.accepted'), value: stats.accepted, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: CheckCircle2 },
            { label: t('decisions.stats.implemented'), value: stats.implemented, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20', icon: Activity },
            { label: t('decisions.stats.total'), value: stats.total, color: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-950/20', icon: Layers },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                className={cn('flex items-center gap-4 rounded-2xl border border-surface-200/70 p-5 shadow-soft backdrop-blur-xl dark:border-navy-700/50', stat.bg)}
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.bg)}>
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                  <p className={cn('text-xs font-medium', stat.color)}>{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8">
        <div className="flex gap-1 rounded-xl bg-surface-100/80 p-1 dark:bg-navy-800/40">
          {filterTabs.map((tab) => (
            <button
              key={tab.id} type="button" onClick={() => setFilter(tab.id)}
              className={cn(
                'flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all',
                filter === tab.id
                  ? 'bg-white text-navy-900 shadow-sm dark:bg-navy-800 dark:text-white'
                  : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
              )}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span className="ml-1.5 text-2xs text-surface-400">
                  ({localDecisions.filter((d) => d.status === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 space-y-4">
        {filteredDecisions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{t('decisions.noPendingDecisions')}</h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{t('decisions.allCaughtUp')}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredDecisions.map((decision, index) => (
              <DecisionCard
                key={decision.id} decision={decision} index={index}
                isExpanded={expandedId === decision.id}
                onToggle={() => toggleExpand(decision.id)}
                onAccept={() => handleAccept(decision.id)}
                onReject={() => handleReject(decision.id)}
                onDefer={() => handleDefer(decision.id)}
                rejectReason={rejectReasons[decision.id] ?? ''}
                setRejectReason={(val) => setRejectReasons((prev) => ({ ...prev, [decision.id]: val }))}
                showRejectInput={showRejectInputs[decision.id] ?? false}
                setShowRejectInput={(val) => setShowRejectInputs((prev) => ({ ...prev, [decision.id]: val }))}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
