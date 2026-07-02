import { useCallback, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  Activity,
  BarChart3,
  ListChecks,
  Bell,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore, useLogout } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 64

const NAV_SECTIONS = [
  {
    key: 'aware',
    label: '',
    labelAr: '',
    items: [
      { labelKey: 'nav.nationalSituation', icon: LayoutDashboard, to: '/' },
    ],
  },
  {
    key: 'understand',
    label: '',
    labelAr: '',
    items: [
      { labelKey: 'nav.provinces', icon: Map, to: '/provinces' },
      { labelKey: 'nav.reports', icon: FileText, to: '/reports' },
    ],
  },
  {
    key: 'act',
    label: '',
    labelAr: '',
    items: [
      { labelKey: 'nav.decisions', icon: FileCheck, to: '/decisions' },
      { labelKey: 'nav.aiAssistant', icon: Bot, to: '/assistant' },
    ],
  },
  {
    key: 'tools',
    labelAr: 'أدوات',
    label: 'Tools',
    items: [
      { labelKey: 'nav.compare', icon: GitCompare, to: '/compare' },
      { labelKey: 'nav.search', icon: Search, to: '/search' },
      { labelKey: 'nav.organizations', icon: Building2, to: '/organizations' },
      { labelKey: 'nav.documents', icon: FolderOpen, to: '/documents' },
      { labelKey: 'nav.settings', icon: Settings, to: '/settings' },
    ],
  },
]

function Sidebar() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isCollapsed, toggle, isMobileOpen, setMobileOpen } = useSidebar()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [setMobileOpen])

  const sidebarContent = (
    <nav className="flex h-full flex-col bg-navy-950 text-surface-300 border-l border-navy-800/50">
      {/* Logo Area */}
      <div className="flex shrink-0 items-center border-b border-navy-800/50 px-5" style={{ height: 64 }}>
        <div className={cn('flex items-center gap-3.5', isCollapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center shrink-0">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-algeria-500">
              <path d="M4 16L16 4L28 16L16 28L4 16Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M10 16L16 10L22 16L16 22L10 16Z" fill="currentColor"/>
              <path d="M4 16H10M22 16H28M16 4V10M16 22V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-base font-semibold tracking-tight text-white mb-0.5 block">منصة المراقبة</span>
                <span className="block text-micro font-semibold uppercase tracking-widest text-surface-400">Monadhama</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 hide-scrollbar space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.key}>
            {!isCollapsed && (
              <div className="px-2 mb-1.5">
                <span className="text-micro font-semibold uppercase tracking-widest text-surface-500">
                  {isRTL && section.labelAr ? section.labelAr : section.label}
                </span>
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon
                const label = t(item.labelKey)
                return (
                  <li key={item.to} className="relative">
                    <NavLink
                      to={item.to}
                      onClick={closeMobile}
                      onMouseEnter={() => setHoveredItem(item.to)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-algeria-500',
                        isCollapsed ? 'justify-center px-0 mx-auto w-10 h-10' : '',
                        isActive
                          ? 'bg-algeria-500/15 text-white shadow-sm ring-1 ring-algeria-500/30'
                          : 'text-surface-400 hover:bg-navy-800/60 hover:text-white',
                      )}
                    >
                      {isActive && !isCollapsed && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 w-1 h-6 bg-algeria-500 rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <Icon className={cn('shrink-0 transition-colors', isCollapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4', isActive ? 'text-algeria-400' : 'group-hover:text-surface-300')} />
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            key={`label-${label}`}
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden whitespace-nowrap text-sm"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && hoveredItem === item.to && (
                      <div className={cn(
                        'absolute z-50 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-btn bg-navy-900 border border-navy-700 shadow-elevated text-tiny font-medium text-surface-200 whitespace-nowrap',
                        isRTL ? 'right-full mr-2' : 'left-full ml-2',
                      )}>
                        {label}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Area */}
      <div className={cn('shrink-0 border-t border-navy-800/50 px-2 py-3', isCollapsed && 'px-2')}>
        <div className={cn('flex items-center gap-2.5 rounded-btn px-2 py-2', !isCollapsed && 'hover:bg-navy-800/50')}>
          <Avatar name={user?.full_name || 'User'} size="sm" status="online" className="shrink-0 ring-2 ring-algeria-500/20" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-w-0 flex-1 flex-col overflow-hidden"
              >
                <span className="truncate text-sm font-medium text-white">{user?.full_name || 'User'}</span>
                <span className="truncate text-tiny text-surface-500">{user?.email || ''}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="flex shrink-0 items-center justify-center rounded-btn p-1.5 text-surface-500 hover:bg-navy-800/50 hover:text-surface-300"
              aria-label={t('nav.signOut')}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <div className={cn('shrink-0 border-t border-navy-800/50 px-2 py-2.5', isCollapsed && 'flex justify-center')}>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex items-center justify-center rounded-btn p-2 text-surface-500 transition-colors hover:bg-navy-800/50 hover:text-surface-200',
            isCollapsed && 'mx-auto',
          )}
          aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  )

  return (
    <>
      <motion.aside
        animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex h-screen shrink-0 flex-col overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

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
              className={cn('fixed inset-y-0 z-50 w-60 md:hidden', isRTL ? 'right-0' : 'left-0')}
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
