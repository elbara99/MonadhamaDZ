import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Search, ArrowUpDown, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReports } from '@/hooks/use-reports'
import type { ReportRead } from '@/lib/api-types'
import { format } from 'date-fns'

const PAGE_SIZE = 10

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

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
    <div className="mx-auto max-w-[1200px] pb-12">
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
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6">
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input
              placeholder={t('reports.searchReports')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </Card>
      </motion.div>

      {isLoading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-danger-500 mb-4" />
          <p className="text-lg font-medium text-surface-900 dark:text-surface-100">{t('common.error')}</p>
          <p className="text-sm text-surface-500 mt-1">{(error as any)?.response?.data?.detail || t('common.noResults')}</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-surface-200/70 bg-white shadow-sm dark:border-surface-800/50 dark:bg-surface-900">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 dark:bg-surface-800/50">
                <tr>
                  {['title', 'generated_at'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort(col)} className="flex items-center gap-1 font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">
                        {col === 'title' ? t('reports.table.reportName') : t('reports.table.generated')}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">{t('reports.table.type')}</th>
                  <th className="px-4 py-3 text-right">{t('reports.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {data.items.map((report: ReportRead) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{report.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{report.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(report.generated_at), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success" size="sm">{t('status.completed')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">{t('common.view')}</Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-surface-500">
            <span>{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} / {data.total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</Button>
              <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
            </div>
          </div>
        </motion.div>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-surface-300 dark:text-surface-600 mb-4" />
          <p className="text-lg font-medium text-surface-900 dark:text-surface-100">{t('reports.noReportsYet')}</p>
          <p className="text-sm text-surface-500 mt-1">{t('reports.noReportsDesc')}</p>
        </div>
      )}
    </div>
  )
}
