import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Search, ArrowUpDown, Loader2, AlertCircle, Building2, ChevronRight } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useOrganizations, useDeleteOrganization } from '@/hooks/use-organizations'
import { useProvinces } from '@/hooks/use-provinces'
import type { OrganizationRead } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

const orgTypeColors: Record<string, string> = {
  ministry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  department: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  institution: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  municipality: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function OrganizationsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('code')
  const [sortOrder, setSortOrder] = useState('asc')

  const { data, isLoading, isError, error } = useOrganizations({ search, sort_by: sortBy, sort_order: sortOrder, page, page_size: PAGE_SIZE })
  const deleteOrg = useDeleteOrganization()

  const deleteOrgHandler = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      deleteOrg.mutate(id)
    }
  }

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">{t('nav.organizations')}</h1>
            <p className="text-sm text-surface-500">Manage government organizations and institutions</p>
          </div>
          <Button size="sm" className="mt-3 sm:mt-0">
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card className="p-4 shadow-soft">
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
          </div>
        </Card>
      </motion.div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-danger-500 mb-4" />
          <p className="text-lg font-medium text-navy-900 dark:text-white">{t('common.error')}</p>
          <p className="text-sm text-surface-500 mt-1">{(error as any)?.response?.data?.detail || t('common.noResults')}</p>
        </div>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-surface-300 dark:text-surface-600 mb-4" />
          <p className="text-lg font-medium text-navy-900 dark:text-white">{t('common.noResults')}</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
          <div className="section-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {['code', 'name_fr', 'type', 'province_code'].map((col) => (
                      <th key={col}>
                        <button onClick={() => toggleSort(col)} className="flex items-center gap-1 font-medium">
                          {t(`organizations.${col === 'name_fr' ? 'name' : col}`, col)}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                    <th className="text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((org: OrganizationRead) => (
                    <motion.tr key={org.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td className="font-semibold text-navy-900 dark:text-white">{org.code}</td>
                      <td className="text-surface-700 dark:text-surface-300">{org.name_fr}</td>
                      <td>
                        <Badge className={cn('capitalize', orgTypeColors[org.type] || '')}>{org.type}</Badge>
                      </td>
                      <td className="text-surface-600 dark:text-surface-400">{org.province_code}</td>
                      <td className="text-right">
                        <button
                          onClick={() => deleteOrgHandler(org.id)}
                          className="text-xs font-semibold uppercase tracking-wider text-danger-600 hover:text-danger-500 dark:text-danger-400"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-surface-100 px-4 py-3 text-sm text-surface-500 dark:border-navy-700">
              <span>{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} / {data.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
