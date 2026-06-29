'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Heart,
  Book,
  TrendingUp,
  Building2,
  Globe,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

type ReportStatus = 'completed' | 'generating' | 'failed'
type SortField = 'name' | 'province' | 'type' | 'date' | 'status'
type SortDir = 'asc' | 'desc'

interface Report {
  id: string
  name: string
  provinces: string[]
  type: string
  sector: string
  generatedAt: string
  status: ReportStatus
  format: string
  language: string
  hasAiInsights: boolean
  hasRecommendations: boolean
}

interface Template {
  id: string
  name: string
  description: string
  icon: typeof FileText
}

const mockReports: Report[] = [
  { id: 'rpt-001', name: 'مراجعة قطاع الصحة في الجزائر العاصمة', provinces: ['Algiers'], type: 'تحليل قطاعي', sector: 'الصحة', generatedAt: '2026-06-28T09:15:00Z', status: 'completed', format: 'PDF', language: 'الإنجليزية', hasAiInsights: true, hasRecommendations: true },
  { id: 'rpt-002', name: 'النظرة الاقتصادية للولايات الجنوبية', provinces: ['Tamanrasset', 'Illizi', 'Adrar'], type: 'تحليل قطاعي', sector: 'الاقتصاد', generatedAt: '2026-06-27T14:30:00Z', status: 'completed', format: 'PDF', language: 'الإنجليزية', hasAiInsights: true, hasRecommendations: false },
  { id: 'rpt-003', name: 'لوحة التعليم الوطنية الربع الثاني 2026', provinces: ['All Provinces'], type: 'نظرة وطنية', sector: 'التعليم', generatedAt: '2026-06-26T11:00:00Z', status: 'completed', format: 'HTML', language: 'الفرنسية', hasAiInsights: true, hasRecommendations: true },
  { id: 'rpt-004', name: 'تحليل فجوة البنية التحتية — الهضاب العليا', provinces: ['Tiaret', 'Djelfa', 'Médéa', 'Msila'], type: 'تحليل قطاعي', sector: 'البنية التحتية', generatedAt: '2026-06-25T08:45:00Z', status: 'completed', format: 'PDF', language: 'العربية', hasAiInsights: false, hasRecommendations: true },
  { id: 'rpt-005', name: 'مقارنة الاستثمار بين وهران وعنابة', provinces: ['Oran', 'Annaba'], type: 'نظرة عامة على الولاية', sector: 'الاقتصاد', generatedAt: '2026-06-24T16:20:00Z', status: 'completed', format: 'DOCX', language: 'الإنجليزية', hasAiInsights: true, hasRecommendations: false },
  { id: 'rpt-006', name: 'الملف الشامل للولايات الساحلية', provinces: ['Algiers', 'Oran', 'Annaba', 'Skikda', 'Béjaïa'], type: 'نظرة عامة على الولاية', sector: 'متعدد القطاعات', generatedAt: '2026-06-23T10:00:00Z', status: 'completed', format: 'HTML', language: 'الفرنسية', hasAiInsights: true, hasRecommendations: true },
  { id: 'rpt-007', name: 'الموارد المائية — المناطق الصحراوية', provinces: ['Tamanrasset', 'Ouargla', 'Béchar', 'El Oued'], type: 'تحليل قطاعي', sector: 'المياه', generatedAt: '2026-06-28T12:00:00Z', status: 'generating', format: 'PDF', language: 'الإنجليزية', hasAiInsights: true, hasRecommendations: true },
  { id: 'rpt-008', name: 'تقييم الأمن — الولايات الحدودية', provinces: ['Tindouf', 'Béchar', 'Tamanrasset', 'Illizi'], type: 'تحليل قطاعي', sector: 'الأمن', generatedAt: '2026-06-22T07:30:00Z', status: 'failed', format: 'PDF', language: 'الإنجليزية', hasAiInsights: false, hasRecommendations: false },
  { id: 'rpt-009', name: 'تقرير التوظيف والتكوين المهني', provinces: ['Skikda', 'Sétif', 'Tizi Ouzou'], type: 'تحليل قطاعي', sector: 'التوظيف', generatedAt: '2026-06-21T15:15:00Z', status: 'completed', format: 'DOCX', language: 'العربية', hasAiInsights: true, hasRecommendations: true },
  { id: 'rpt-010', name: 'إمكانات الثقافة الأمازيغية والسياحة', provinces: ['Tizi Ouzou', 'Béjaïa', 'Batna'], type: 'نظرة عامة على الولاية', sector: 'السياحة', generatedAt: '2026-06-20T09:00:00Z', status: 'completed', format: 'PDF', language: 'الفرنسية', hasAiInsights: false, hasRecommendations: false },
]

const provinceOptions = ['Algiers', 'Oran', 'Annaba', 'Tamanrasset', 'Illizi', 'Adrar', 'Béchar', 'Ouargla', 'El Oued', 'Tiaret', 'Djelfa', 'Médéa', 'Msila', 'Skikda', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tindouf']

function timeAgo(dateStr: string, t: (key: string, options?: any) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('time.justNow')
  if (mins < 60) return t('time.minutesAgo', { count: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return t('time.hoursAgo', { count: hrs })
  const days = Math.floor(hrs / 24)
  return t('time.daysAgo', { count: days })
}

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

function Toast({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white px-5 py-3.5 shadow-lg dark:border-emerald-900/50 dark:bg-surface-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-surface-900 dark:text-white">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MultiSelectChips({
  options,
  selected,
  onChange,
  label,
}: {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
  label: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 py-2 text-left text-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900"
      >
        {selected.length === 0 ? (
          <span className="text-surface-400 dark:text-surface-500">{t('reports.form.selectProvinces')}</span>
        ) : (
          selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
            >
              {s}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleOption(s) }}
                className="text-primary-400 hover:text-primary-600 dark:hover:text-primary-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={cn('ml-auto h-4 w-4 text-surface-400 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute z-10 mt-1 w-full rounded-xl border border-surface-200 bg-white p-1.5 shadow-lg dark:border-surface-700 dark:bg-surface-800"
          >
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    selected.includes(opt)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-surface-600 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700',
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    selected.includes(opt)
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-surface-300 dark:border-surface-600',
                  )}>
                    {selected.includes(opt) && <CheckCircle2 className="h-3 w-3" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
  label,
}: {
  options: string[]
  value: string
  onChange: (val: string) => void
  label?: string
}) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
      <div className="flex gap-1 rounded-xl bg-surface-100/80 p-1 dark:bg-surface-800/40">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
              value === opt
                ? 'bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white'
                : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [formTitle, setFormTitle] = useState('')
  const [formTemplate, setFormTemplate] = useState(t('reports.typeOptions.provinceOverview'))
  const [formProvinces, setFormProvinces] = useState<string[]>([])
  const [formSector, setFormSector] = useState(t('decisions.health'))
  const [formYear, setFormYear] = useState('2026')
  const [formQuarter, setFormQuarter] = useState('Q2')
  const [formFormat, setFormFormat] = useState('PDF')
  const [formLanguage, setFormLanguage] = useState(t('reports.languageOptions.english'))
  const [formAiInsights, setFormAiInsights] = useState(true)
  const [formRecommendations, setFormRecommendations] = useState(true)
  const [generating, setGenerating] = useState(false)

  const statusConfig: Record<ReportStatus, { label: string; variant: 'success' | 'warning' | 'danger'; dot: string }> = {
    completed: { label: t('status.completed'), variant: 'success', dot: 'bg-emerald-500' },
    generating: { label: t('status.generating'), variant: 'warning', dot: 'bg-warning-500' },
    failed: { label: t('status.failed'), variant: 'danger', dot: 'bg-danger-500' },
  }

  const typeOptions = [t('reports.typeOptions.provinceOverview'), t('reports.typeOptions.sectorAnalysis'), t('reports.typeOptions.comparison')]
  const formatOptions = [t('reports.formatOptions.pdf'), t('reports.formatOptions.html'), t('reports.formatOptions.docx')]
  const languageOptions = [t('reports.languageOptions.english'), t('reports.languageOptions.arabic'), t('reports.languageOptions.french')]
  const sectorOptions = [
    t('reports.sectors.health'), t('reports.sectors.education'), t('reports.sectors.economy'),
    t('reports.sectors.infrastructure'), t('reports.sectors.security'), t('reports.sectors.employment'),
    t('reports.sectors.water'), t('reports.sectors.tourism'), t('reports.sectors.multiSector'),
  ]

  const templates: Template[] = [
    { id: 'province-health', name: t('reports.template.provinceHealth'), description: t('reports.template.provinceHealthDesc'), icon: Heart },
    { id: 'education-sector', name: t('reports.template.educationSector'), description: t('reports.template.educationSectorDesc'), icon: Book },
    { id: 'economic-performance', name: t('reports.template.economicPerformance'), description: t('reports.template.economicPerformanceDesc'), icon: TrendingUp },
    { id: 'infrastructure-assessment', name: t('reports.template.infrastructureAssessment'), description: t('reports.template.infrastructureAssessmentDesc'), icon: Building2 },
    { id: 'comprehensive-profile', name: t('reports.template.comprehensiveProfile'), description: t('reports.template.comprehensiveProfileDesc'), icon: FileText },
    { id: 'national-overview', name: t('reports.template.nationalOverview'), description: t('reports.template.nationalOverviewDesc'), icon: Globe },
  ]

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3500)
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let list = [...mockReports]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.provinces.some((p) => p.toLowerCase().includes(q)) ||
          r.type.toLowerCase().includes(q) ||
          r.sector.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter)
    }
    list.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'province': cmp = a.provinces[0]?.localeCompare(b.provinces[0] ?? '') ?? 0; break
        case 'type': cmp = a.type.localeCompare(b.type); break
        case 'date': cmp = new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime(); break
        case 'status': cmp = a.status.localeCompare(b.status); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [searchQuery, statusFilter, sortField, sortDir])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setModalOpen(false)
      showToast(t('reports.form.generationStarted'))
      setFormTitle('')
      setFormProvinces([])
    }, 1500)
  }

  const handleTemplateGenerate = (templateName: string) => {
    setFormTitle(templateName)
    setModalOpen(true)
  }

  const statusCounts = useMemo(() => {
    const all = mockReports.length
    const completed = mockReports.filter((r) => r.status === 'completed').length
    const generating = mockReports.filter((r) => r.status === 'generating').length
    const failed = mockReports.filter((r) => r.status === 'failed').length
    return { all, completed, generating, failed }
  }, [])

  function getSortIcon(field: SortField) {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  return (
    <div className="mx-auto max-w-[1200px] pb-12">
      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
              {t('reports.title')}
            </h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {t('reports.description')}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <FileText className="h-4 w-4" />
            {t('reports.generateReport')}
          </Button>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('reports.stats.totalReports'), value: statusCounts.all, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/20', icon: FileText },
            { label: t('reports.stats.completed'), value: statusCounts.completed, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: CheckCircle2 },
            { label: t('reports.stats.generating'), value: statusCounts.generating, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/20', icon: Loader2 },
            { label: t('reports.stats.failed'), value: statusCounts.failed, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-950/20', icon: AlertCircle },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className={cn('flex items-center gap-4 rounded-2xl border border-surface-200/70 p-5 shadow-sm backdrop-blur-xl dark:border-surface-800/50', stat.bg)}
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.bg)}>
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                  <p className={cn('text-xs font-medium', stat.color)}>{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Templates */}
      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">{t('reports.quickTemplates')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {templates.map((template, i) => {
            const Icon = template.icon
            return (
              <motion.div
                key={template.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="group flex shrink-0 w-56 flex-col rounded-2xl border border-surface-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-800/50 dark:bg-surface-900/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{template.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-surface-500 dark:text-surface-400 flex-1">
                  {template.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateGenerate(template.name)}
                  className="mt-3 gap-1.5 self-start text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t('common.generate')}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Filters */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('reports.searchReports')}
              className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:placeholder-surface-500"
            />
          </div>
          <div className="flex gap-1.5 rounded-xl bg-surface-100/80 p-1 dark:bg-surface-800/40">
            {[
              { id: 'all', label: t('reports.filters.all') },
              { id: 'completed', label: t('reports.filters.completed') },
              { id: 'generating', label: t('reports.filters.generating') },
              { id: 'failed', label: t('reports.filters.failed') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all',
                  statusFilter === tab.id
                    ? 'bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white'
                    : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reports Table */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white shadow-sm dark:border-surface-800/50 dark:bg-surface-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sortable sortDirection={sortField === 'name' ? sortDir : null} onSort={() => toggleSort('name')}>
                  {t('reports.table.reportName')} {getSortIcon('name')}
                </TableHead>
                <TableHead sortable sortDirection={sortField === 'province' ? sortDir : null} onSort={() => toggleSort('province')}>
                  {t('reports.table.provinces')} {getSortIcon('province')}
                </TableHead>
                <TableHead sortable sortDirection={sortField === 'type' ? sortDir : null} onSort={() => toggleSort('type')}>
                  {t('reports.table.type')} {getSortIcon('type')}
                </TableHead>
                <TableHead sortable sortDirection={sortField === 'date' ? sortDir : null} onSort={() => toggleSort('date')}>
                  {t('reports.table.generated')} {getSortIcon('date')}
                </TableHead>
                <TableHead sortable sortDirection={sortField === 'status' ? sortDir : null} onSort={() => toggleSort('status')}>
                  {t('reports.table.status')} {getSortIcon('status')}
                </TableHead>
                <TableHead className="text-right">{t('reports.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 dark:bg-surface-800">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-semibold text-surface-900 dark:text-white">
                        {searchQuery ? t('reports.noMatchingReports') : t('reports.noReportsYet')}
                      </h3>
                      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                        {searchQuery ? t('reports.adjustSearch') : t('reports.noReportsDesc')}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((report) => {
                  const config = statusConfig[report.status]
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            report.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            report.status === 'generating' ? 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400' :
                            'bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
                          )}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">{report.name}</p>
                            <p className="text-2xs text-surface-400 mt-0.5">{report.format} &middot; {report.language}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {report.provinces.map((p) => (
                            <span key={p} className="inline-flex rounded-md bg-surface-100 px-2 py-0.5 text-2xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                              {p === 'All Provinces' ? t('reports.table.all58') : p}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-surface-700 dark:text-surface-300">
                          {report.type}
                          <span className="text-surface-400"> &middot; {report.sector}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-surface-700 dark:text-surface-300" title={new Date(report.generatedAt).toLocaleDateString()}>
                          {timeAgo(report.generatedAt, t)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} dot size="sm">
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === 'completed' && (
                            <Button variant="ghost" size="sm" iconOnly className="text-surface-400 hover:text-primary-500">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === 'completed' && (
                            <Button variant="ghost" size="sm" iconOnly className="text-surface-400 hover:text-emerald-500">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === 'generating' && (
                            <Button variant="ghost" size="sm" iconOnly className="text-surface-400" disabled>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" iconOnly className="text-surface-400 hover:text-danger-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Generate Report Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!generating) setModalOpen(false) }}
        title={t('reports.generateReport')}
        description={t('reports.description')}
        size="xl"
      >
        <div className="space-y-5">
          <Input
            label={t('reports.form.title')}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={t('reports.form.reportTitlePlaceholder')}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('reports.form.template')}</label>
            <select
              value={formTemplate}
              onChange={(e) => setFormTemplate(e.target.value)}
              className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <MultiSelectChips
            label={t('reports.form.provinces')}
            options={provinceOptions}
            selected={formProvinces}
            onChange={setFormProvinces}
          />

          {formTemplate === t('reports.typeOptions.sectorAnalysis') && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('reports.form.sectorDimension')}</label>
              <select
                value={formSector}
                onChange={(e) => setFormSector(e.target.value)}
                className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              >
                {sectorOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('reports.form.year')}</label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              >
                {['2026', '2025', '2024', '2023'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('reports.form.quarter')}</label>
              <select
                value={formQuarter}
                onChange={(e) => setFormQuarter(e.target.value)}
                className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              >
                {[
                  { value: 'Q1', label: t('time.q1') },
                  { value: 'Q2', label: t('time.q2') },
                  { value: 'Q3', label: t('time.q3') },
                  { value: 'Q4', label: t('time.q4') },
                  { value: 'Annual', label: t('time.annual') },
                ].map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>

          <SegmentedControl label={t('reports.form.format')} options={formatOptions} value={formFormat} onChange={setFormFormat} />
          <SegmentedControl label={t('reports.form.language')} options={languageOptions} value={formLanguage} onChange={setFormLanguage} />

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 dark:border-surface-700">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{t('reports.form.includeAiInsights')}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{t('reports.form.includeAiInsightsDesc')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formAiInsights}
                onClick={() => setFormAiInsights(!formAiInsights)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                  formAiInsights ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600',
                )}
              >
                <span className={cn(
                  'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  formAiInsights ? 'translate-x-[22px]' : 'translate-x-0.5',
                )} />
              </button>
            </label>
            <label className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 dark:border-surface-700">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{t('reports.form.includeRecommendations')}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{t('reports.form.includeRecommendationsDesc')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formRecommendations}
                onClick={() => setFormRecommendations(!formRecommendations)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                  formRecommendations ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600',
                )}
              >
                <span className={cn(
                  'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  formRecommendations ? 'translate-x-[22px]' : 'translate-x-0.5',
                )} />
              </button>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-surface-200 pt-5 dark:border-surface-700">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={generating}>
              {t('reports.form.cancel')}
            </Button>
            <Button onClick={handleGenerate} loading={generating} className="gap-2">
              {!generating && <FileText className="h-4 w-4" />}
              {t('reports.generateReport')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  )
}
