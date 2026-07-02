import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Sun, Moon, Menu, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/use-theme'
import { useSidebar } from '@/hooks/use-sidebar'
import { useAuthStore, useLogout } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'

interface TopbarProps {
  title?: string
  breadcrumbs?: { label: string; to?: string }[]
  actions?: ReactNode
}

function Topbar({ title, breadcrumbs, actions }: TopbarProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { setMobileOpen } = useSidebar()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-surface-200/60 bg-white/80 backdrop-blur-xl dark:border-navy-800/50 dark:bg-navy-950/80 px-4 lg:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center justify-center rounded-xl p-2 text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-navy-800 md:hidden"
        aria-label={t('common.open')}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-surface-300 dark:text-navy-600">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="text-surface-400 transition-colors hover:text-navy-900 dark:text-surface-500 dark:hover:text-white">{crumb.label}</Link>
                ) : (
                  <span className="font-semibold text-navy-900 dark:text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-lg font-bold tracking-tight text-navy-900 dark:text-white">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        {actions}

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:text-surface-500 dark:hover:bg-navy-800 dark:hover:text-surface-200"
          aria-label={theme === 'dark' ? t('common.light') : t('common.dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="hidden h-9 items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 text-sm text-surface-400 transition-colors hover:border-surface-300 dark:border-navy-700 dark:bg-navy-800/50 dark:text-surface-500 dark:hover:border-navy-600 md:flex"
        >
          <Search className="h-4 w-4" />
          <span>{t('common.searchPlaceholder')}</span>
          <kbd className="ml-auto rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-2xs font-medium text-surface-400 dark:border-navy-600 dark:bg-navy-900 dark:text-surface-500">⌘K</kbd>
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition-colors hover:bg-surface-100 dark:text-surface-500 dark:hover:bg-navy-800 md:hidden"
          aria-label={t('common.search')}
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            ref={notifRef}
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition-colors hover:bg-surface-100 dark:text-surface-500 dark:hover:bg-navy-800"
            aria-label={t('common.notifications')}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger-500 px-1 text-3xs font-bold text-white">3</span>
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-navy-700 dark:bg-navy-900"
              >
                <div className="border-b border-surface-100 px-5 py-3 dark:border-navy-800">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">{t('common.notifications')}</p>
                </div>
                <div className="p-5">
                  <p className="text-center text-sm text-surface-500 dark:text-surface-400">{t('common.noItems')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            ref={profileRef}
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-surface-100 dark:hover:bg-navy-800"
          >
            <Avatar name={user?.full_name || 'User'} size="sm" className="ring-2 ring-surface-200 dark:ring-navy-700" />
            <ChevronDown className="hidden h-3.5 w-3.5 text-surface-400 sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-navy-700 dark:bg-navy-900"
              >
                <div className="border-b border-surface-100 px-4 py-3 dark:border-navy-800">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-surface-400">{user?.email || ''}</p>
                </div>
                <div className="p-1">
                  <button type="button" onClick={() => navigate('/settings')} className="w-full rounded-lg px-3 py-2 text-left text-sm text-surface-600 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-navy-800">{t('nav.settings')}</button>
                  <button type="button" onClick={() => logoutMutation.mutate()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-surface-600 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-navy-800">
                    <LogOut className="h-4 w-4" /> {t('nav.signOut')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export { Topbar }
