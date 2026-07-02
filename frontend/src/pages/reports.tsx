import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Search, ArrowUpDown, AlertCircle, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReports } from '@/hooks/use-reports'
import type { ReportRead } from '@/lib/api-types'
import { format } from 'date-fns'

const PAGE_SIZE = 10

export default function ReportsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('generated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const { data, isLoading, isError, error } = useReports({ search, sort_by: sortBy, sort_order: sortOrder, page, page_size: PAGE_SIZE })

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortOrder('asc') }
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
        custom={0}
      >
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('reports.title')}</h1>
            <p className="page-subtitle">{t('reports.description')}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.05, ease: [0.4, 0, 0.2, 1] } }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder={t('reports.searchReports')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="form-input w-full pl-3 pr-9"
          />
        </div>
      </motion.div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.1 + i * 0.03, ease: [0.4, 0, 0.2, 1] } }}
            >
              <Skeleton variant="card" className="h-16 !rounded-card" />
            </motion.div>
          ))}
        </div>
      )}

      {isError && (
        <div className="empty-state">
          <AlertCircle className="empty-state-icon h-12 w-12 text-danger-500" />
          <p className="empty-state-title">{t('common.error')}</p>
          <p className="empty-state-desc">{(error as any)?.response?.data?.detail || t('common.noResults')}</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] } }}
        >
          <div className="card-standard overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('reports.table.reportName')}</th>
                    <th>
                      <button onClick={() => toggleSort('generated_at')} className="flex items-center gap-1 font-medium">
                        {t('reports.table.generated')}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th>{t('reports.table.type')}</th>
                    <th className="text-left">{t('reports.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((report: ReportRead, i: number) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.15 + i * 0.02 } }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-card bg-algeria-50 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-900 dark:text-white">{report.title}</p>
                            <p className="text-tiny text-surface-400 mt-0.5">{report.description}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-tiny">{format(new Date(report.generated_at), 'yyyy-MM-dd')}</span>
                        </div>
                      </td>
                      <td><Badge variant="success" size="sm">{t('status.completed')}</Badge></td>
                      <td className="text-left">
                        <Button variant="ghost" size="sm" className="gap-1">
                          {t('common.view')} <ChevronRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-surface-100 px-4 py-3 text-tiny text-surface-500 dark:border-navy-700">
              <span>{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} / {data.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <div className="empty-state">
          <FileText className="empty-state-icon h-12 w-12" />
          <p className="empty-state-title">{t('reports.noReportsYet')}</p>
          <p className="empty-state-desc">{t('reports.noReportsDesc')}</p>
        </div>
      )}
    </div>
  )
}
