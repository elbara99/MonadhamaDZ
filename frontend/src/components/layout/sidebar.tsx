import { useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Map,
  Building2,
  FolderOpen,
  GitCompare,
  Search,
  Bot,
  FileCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore, useLogout } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 64

function Sidebar() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isCollapsed, toggle, isMobileOpen, setMobileOpen } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()

  const NAV_ITEMS = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, to: '/' },
    { label: t('nav.provinces'), icon: Map, to: '/provinces' },
    { label: t('nav.organizations'), icon: Building2, to: '/organizations' },
    { label: t('nav.documents'), icon: FolderOpen, to: '/documents' },
    { label: t('nav.compare'), icon: GitCompare, to: '/compare' },
    { label: t('nav.search'), icon: Search, to: '/search' },
    { label: t('nav.aiAssistant'), icon: Bot, to: '/assistant' },
    { label: t('nav.decisions'), icon: FileCheck, to: '/decisions' },
    { label: t('nav.reports'), icon: FileText, to: '/reports' },
    { label: t('nav.settings'), icon: Settings, to: '/settings' },
  ] as const

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [setMobileOpen])

  const sidebarContent = (
    <nav
      className={cn(
        'flex h-full flex-col bg-surface-950 text-surface-300',
        'transition-colors duration-200',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-surface-800/60 px-4',
          isCollapsed ? 'justify-center' : 'gap-3',
        )}
        style={{ height: 64 }}
      >
        <Hexagon className="h-6 w-6 shrink-0 text-primary-400" />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="text-base font-semibold tracking-tight text-white"
            >
              Monadhama
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to
            const Icon = item.icon

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeMobile}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isCollapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors duration-150',
                      isActive && 'text-primary-400',
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key={`label-${item.label}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>

      {/* User Profile */}
      <div
        className={cn(
          'shrink-0 border-t border-surface-800/60 px-4 py-4',
          isCollapsed && 'flex flex-col items-center px-2',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2',
            !isCollapsed && 'hover:bg-surface-800/50',
          )}
        >
          <Avatar
            name={user?.full_name || 'User'}
            size="sm"
            status="online"
            className="shrink-0"
          />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="flex min-w-0 flex-1 flex-col overflow-hidden"
              >
                <span className="truncate text-sm font-medium text-white">
                  {user?.full_name || 'User'}
                </span>
                <span className="truncate text-xs text-surface-500">
                  {user?.email || ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="flex shrink-0 items-center justify-center rounded-md p-1 text-surface-500 hover:text-surface-300"
              aria-label={t('nav.signOut')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div
        className={cn(
          'shrink-0 border-t border-surface-800/60 px-2 py-3',
          isCollapsed && 'flex justify-center',
        )}
      >
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex items-center justify-center rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-800/50 hover:text-surface-200',
            isCollapsed && 'mx-auto',
          )}
          aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          'hidden md:flex h-screen shrink-0 flex-col overflow-hidden',
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.aside
              key="sidebar-mobile"
              initial={{ x: isRTL ? SIDEBAR_EXPANDED : -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? SIDEBAR_EXPANDED : -SIDEBAR_EXPANDED }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                'fixed inset-y-0 z-50 w-60 md:hidden',
                isRTL ? 'right-0' : 'left-0',
              )}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { Sidebar }
export type { SidebarStore } from '@/hooks/use-sidebar'
