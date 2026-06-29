'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, BarChart3, Activity, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSearchStore, type SearchResult } from '@/hooks/use-search'
import { provinces } from '@/lib/mock-data'

const categoryIcons: Record<string, React.ReactNode> = {
  Provinces: <MapPin className="h-4 w-4" />,
  Sectors: <BarChart3 className="h-4 w-4" />,
  Indicators: <Activity className="h-4 w-4" />,
  Reports: <FileText className="h-4 w-4" />,
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-primary-500/20 text-primary-600 dark:text-primary-300">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

interface SearchCommandProps {
  onSelect: (item: SearchResult) => void
  className?: string
}

export function SearchCommand({ onSelect, className }: SearchCommandProps) {
  const { t } = useTranslation()
  const { isOpen, query, setQuery, close } = useSearchStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const categoryLabels = useMemo(() => ({
    Provinces: t('nav.provinces'),
    Sectors: t('common.sector'),
    Indicators: t('compare.indicator'),
    Reports: t('nav.reports'),
  }), [t])

  const sectorNames = useMemo(() => [
    { id: 'health', label: t('decisions.health') },
    { id: 'education', label: t('decisions.education') },
    { id: 'economy', label: t('sectors.economy', { defaultValue: 'Economy' }) },
    { id: 'employment', label: t('decisions.employment') },
    { id: 'infrastructure', label: t('decisions.infrastructure') },
    { id: 'security', label: t('common.security') },
    { id: 'environment', label: t('sectors.environment', { defaultValue: 'Environment' }) },
    { id: 'transportation', label: t('sectors.transportation', { defaultValue: 'Transportation' }) },
    { id: 'tourism', label: t('sectors.tourism', { defaultValue: 'Tourism' }) },
  ], [t])

  const indicatorNames = useMemo(() => [
    { id: 'populationGrowth', label: t('provinceDetail.populationGrowth') },
    { id: 'unemploymentRate', label: t('provinceDetail.unemploymentRate') },
    { id: 'literacyRate', label: t('provinceDetail.literacyRate') },
    { id: 'povertyRate', label: t('provinceDetail.povertyRate') },
    { id: 'internetAccess', label: t('provinceDetail.internetAccess') },
    { id: 'cleanWaterAccess', label: t('provinceDetail.cleanWaterAccess') },
    { id: 'lifeExpectancy', label: t('provinceDetail.lifeExpectancy') },
  ], [t])

  const reportItems = useMemo(() => [
    { id: 'report-province-ranking', title: t('reports.template.comprehensiveProfile', { defaultValue: 'Province Ranking Report' }), subtitle: t('reports.template.comprehensiveProfileDesc', { defaultValue: 'Composite score rankings across all 58 provinces' }) },
    { id: 'report-sector-analysis', title: t('reports.template.educationSector', { defaultValue: 'Sector Analysis' }), subtitle: t('reports.template.educationSectorDesc', { defaultValue: 'Cross-province comparison by development sector' }) },
    { id: 'report-trend-forecast', title: t('reports.template.economicPerformance', { defaultValue: 'Trend Forecast' }), subtitle: t('reports.template.economicPerformanceDesc', { defaultValue: '30-day predictive outlook for key indicators' }) },
    { id: 'report-budget-allocation', title: t('reports.template.infrastructureAssessment', { defaultValue: 'Budget Allocation' }), subtitle: t('reports.template.infrastructureAssessmentDesc', { defaultValue: 'Recommended resource distribution based on scores' }) },
  ], [t])

  const searchIndex = useMemo(() => {
    const results: SearchResult[] = []

    for (const p of provinces) {
      results.push({
        type: 'Provinces',
        id: p.code,
        title: p.name,
        subtitle: `${p.nameAr} · ${t('common.score')}: ${p.compositeScore} · ${t('provinceDetail.population')}: ${p.population.toLocaleString()}`,
      })
    }

    for (const s of sectorNames) {
      results.push({
        type: 'Sectors',
        id: s.id,
        title: s.label,
        subtitle: t('common.sector'),
      })
    }

    for (const ind of indicatorNames) {
      results.push({
        type: 'Indicators',
        id: ind.id,
        title: ind.label,
        subtitle: t('compare.indicator'),
      })
    }

    for (const r of reportItems) {
      results.push({
        type: 'Reports',
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
      })
    }

    return results
  }, [t, sectorNames, indicatorNames, reportItems])

  const filtered = useMemo(() => {
    if (!query.trim()) return searchIndex
    const q = query.toLowerCase()
    return searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    )
  }, [query, searchIndex])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const item of filtered) {
      if (!groups[item.type]) groups[item.type] = []
      groups[item.type].push(item)
    }
    return groups
  }, [filtered])

  const flatResults = useMemo(() => {
    const items: { group: string; result: SearchResult }[] = []
    for (const [group, results] of Object.entries(grouped)) {
      for (const result of results) {
        items.push({ group, result })
      }
    }
    return items
  }, [grouped])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useSearchStore.getState().toggle()
      }
      if (e.key === 'Escape' && useSearchStore.getState().isOpen) {
        useSearchStore.getState().close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (resultsRef.current && flatResults.length > 0) {
      const selected = resultsRef.current.querySelector<HTMLButtonElement>(
        `[data-index="${selectedIndex}"]`,
      )
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, flatResults.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
        e.preventDefault()
        onSelect(flatResults[selectedIndex].result)
        close()
      }
    },
    [flatResults, selectedIndex, onSelect, close],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh]"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-surface-200/50 bg-white shadow-modal dark:border-surface-700/50 dark:bg-surface-900',
              className,
            )}
          >
            <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-800">
              <Search className="h-5 w-5 shrink-0 text-surface-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('common.searchPlaceholder')}
                className="flex-1 bg-transparent text-sm text-surface-900 placeholder-surface-400 outline-none dark:text-surface-100 dark:placeholder-surface-500"
              />
              <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-2xs font-medium text-surface-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500 sm:flex">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>

            <div
              ref={resultsRef}
              className="max-h-[60vh] overflow-y-auto overscroll-contain"
            >
              {flatResults.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-sm text-surface-500 dark:text-surface-400">
                  <Search className="h-8 w-8 opacity-30" />
                  {t('common.noResultsFound')}
                </div>
              )}

              {Object.entries(grouped).map(([group, results]) => (
                <div key={group}>
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                    <span className="text-surface-400">{categoryIcons[group]}</span>
                    <span className="text-2xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                      {categoryLabels[group as keyof typeof categoryLabels]}
                    </span>
                    <span className="text-2xs text-surface-400 dark:text-surface-500">
                      {results.length}
                    </span>
                  </div>

                  {results.map((result) => {
                    const flatIdx = flatResults.findIndex(
                      (f) => f.result.id === result.id && f.group === group,
                    )
                    const isSelected = flatIdx === selectedIndex

                    return (
                      <button
                        key={`${group}-${result.id}`}
                        data-index={flatIdx}
                        onClick={() => {
                          onSelect(result)
                          close()
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-950/40'
                            : 'hover:bg-surface-50 dark:hover:bg-surface-800/50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                            isSelected
                              ? 'border-primary-200 bg-primary-100 text-primary-600 dark:border-primary-800 dark:bg-primary-900/50 dark:text-primary-300'
                              : 'border-surface-200 bg-surface-50 text-surface-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500',
                          )}
                        >
                          {categoryIcons[group]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              'truncate text-sm font-medium',
                              isSelected
                                ? 'text-primary-700 dark:text-primary-300'
                                : 'text-surface-900 dark:text-surface-100',
                            )}
                          >
                            {highlightText(result.title, query)}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-surface-500 dark:text-surface-400">
                            {highlightText(result.subtitle, query)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-4 border-t border-surface-200 px-4 py-2 text-2xs text-surface-400 dark:border-surface-800 dark:text-surface-500 sm:flex">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono dark:border-surface-700 dark:bg-surface-800">
                  ↑↓
                </kbd>
                {t('common.navigate', { defaultValue: 'Navigate' })}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono dark:border-surface-700 dark:bg-surface-800">
                  ↵
                </kbd>
                {t('common.select', { defaultValue: 'Select' })}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono dark:border-surface-700 dark:bg-surface-800">
                  ESC
                </kbd>
                {t('common.close')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
