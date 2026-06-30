import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Search, ArrowUpDown, Loader2, AlertCircle, Building2 } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useOrganizations, useDeleteOrganization } from '@/hooks/use-organizations'
import { useProvinces } from '@/hooks/use-provinces'
import type { OrganizationRead } from '@/lib/api-types'

const PAGE_SIZE = 10

const orgTypeColors: Record<string, string> = {
  ministry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  department: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  institution: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  municipality: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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
    <div>
      <Topbar
        title={t('nav.organizations')}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        }
      />
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
            <p className="text-lg font-medium text-surface-900 dark:text-surface-100">
              {t('common.error')}
            </p>
            <p className="text-sm text-surface-500 mt-1">
              {(error as any)?.response?.data?.detail || t('common.noResults')}
            </p>
          </div>
        )}

        {data && data.items.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-lg font-medium text-surface-900 dark:text-surface-100">
              {t('common.noResults')}
            </p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-800/50">
                  <tr>
                    {['code', 'name_fr', 'type', 'province_code'].map((col) => (
                      <th key={col} className="px-4 py-3 text-left">
                        <button
                          onClick={() => toggleSort(col)}
                          className="flex items-center gap-1 font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200"
                        >
                          {t(`organizations.${col === 'name_fr' ? 'name' : col}`, col)}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {data.items.map((org: OrganizationRead) => (
                    <motion.tr
                      key={org.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-surface-900 dark:text-surface-100">{org.code}</td>
                      <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{org.name_fr}</td>
                      <td className="px-4 py-3">
                        <Badge className={orgTypeColors[org.type] || ''}>{org.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{org.province_code}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteOrgHandler(org.id)}
                          className="text-sm text-danger-600 hover:text-danger-500 dark:text-danger-400"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-surface-500">
              <span>
                {t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} / {data.total}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t('common.previous')}
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>
                  {t('common.next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
