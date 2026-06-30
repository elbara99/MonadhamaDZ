import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, ArrowUpDown, AlertCircle, FileText, Download } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useDocuments } from '@/hooks/use-documents'
import type { DocumentRead } from '@/lib/api-types'
import { format } from 'date-fns'

const PAGE_SIZE = 10

const docTypeColors: Record<string, string> = {
  report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  study: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  contract: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  invoice: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  memo: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export default function DocumentsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('filename')
  const [sortOrder, setSortOrder] = useState('asc')

  const filters: Record<string, any> = { search, sort_by: sortBy, sort_order: sortOrder, page, page_size: PAGE_SIZE }
  if (filterType) filters.document_type = filterType

  const { data, isLoading, isError, error } = useDocuments(filters)

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortOrder('asc') }
  }

  return (
    <div>
      <Topbar title={t('nav.documents')} />
      <div className="p-6 space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
            >
              <option value="">{t('common.all')}</option>
              <option value="report">Report</option>
              <option value="study">Study</option>
              <option value="contract">Contract</option>
              <option value="invoice">Invoice</option>
              <option value="memo">Memo</option>
            </select>
          </div>
        </Card>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-danger-500 mb-4" />
            <p className="text-lg font-medium text-surface-900 dark:text-surface-100">{t('common.error')}</p>
            <p className="text-sm text-surface-500 mt-1">{(error as any)?.response?.data?.detail || t('common.noResults')}</p>
          </div>
        )}

        {data && data.items.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-lg font-medium text-surface-900 dark:text-surface-100">{t('common.noResults')}</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-800/50">
                  <tr>
                    {['filename', 'document_type', 'size', 'created_at'].map((col) => (
                      <th key={col} className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort(col)} className="flex items-center gap-1 font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">
                          {col === 'created_at' ? t('common.date') : col}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {data.items.map((doc: DocumentRead) => (
                    <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-surface-400 shrink-0" />
                          <span className="font-medium text-surface-900 dark:text-surface-100">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={docTypeColors[doc.document_type] || ''}>{doc.document_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{formatFileSize(doc.size)}</td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{format(new Date(doc.created_at), 'yyyy-MM-dd')}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-surface-500">
              <span>{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} / {data.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
