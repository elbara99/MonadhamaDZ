import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { useTranslation } from 'react-i18next'

interface AppLayoutProps {
  title?: string
  breadcrumbs?: { label: string; to?: string }[]
  actions?: ReactNode
  children?: ReactNode
}

function AppLayout({ title, breadcrumbs, actions, children }: AppLayoutProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div
      className={cn('flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} breadcrumbs={breadcrumbs} actions={actions} />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'px-4 py-6 lg:px-8 lg:py-8',
          )}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
export type { AppLayoutProps }
