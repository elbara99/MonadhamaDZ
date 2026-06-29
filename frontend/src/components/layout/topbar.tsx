import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/use-theme'
import { useSidebar } from '@/hooks/use-sidebar'
import { useTranslation } from 'react-i18next'

interface TopbarProps {
  title?: string
  breadcrumbs?: { label: string; to?: string }[]
  actions?: ReactNode
}

const UNREAD_COUNT = 3

function Topbar({ title, breadcrumbs, actions }: TopbarProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { setMobileOpen } = useSidebar()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false)
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-surface-200/70 px-4 lg:px-6',
        'bg-white/70 backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-950/70',
      )}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center justify-center rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 md:hidden"
        aria-label={t('common.open')}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs / Title */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-surface-400 dark:text-surface-500">
                    /
                  </span>
                )}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="text-surface-500 transition-colors hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {title}
          </h1>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          aria-label={theme === 'dark' ? t('common.light') : t('common.dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Search (cmd+K) */}
        <button
          type="button"
          className={cn(
            'hidden h-9 items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-surface-400 transition-colors hover:border-surface-300 hover:text-surface-500 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-500 dark:hover:border-surface-600 dark:hover:text-surface-400',
            'md:flex',
          )}
          aria-label={`${t('common.search')} (Cmd+K)`}
        >
          <Search className="h-4 w-4" />
          <span>{t('common.searchPlaceholder')}</span>
          <kbd className="ml-auto rounded border border-surface-200 bg-surface-100 px-1.5 py-0.5 text-2xs font-medium text-surface-400 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-500">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 md:hidden"
          aria-label={t('common.search')}
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifRef}
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
            aria-label={`${UNREAD_COUNT} ${t('common.notifications')}`}
          >
            <Bell className="h-4 w-4" />
            {UNREAD_COUNT > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-2xs font-semibold text-white">
                {UNREAD_COUNT}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              >
                <div className="border-b border-surface-200 px-4 py-3 dark:border-surface-800">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {t('common.notifications')}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-surface-400">
                    {t('common.noItems')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            ref={profileRef}
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label={t('common.profile')}
          >
            <Avatar name={t('mockData.user.displayName')} size="sm" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              >
                <div className="border-b border-surface-200 px-4 py-3 dark:border-surface-800">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {t('mockData.user.displayName')}
                  </p>
                  <p className="text-xs text-surface-500">
                    {t('mockData.user.email')}
                  </p>
                </div>
                <div className="p-1">
                  {[t('nav.settings'), t('nav.help'), t('nav.signOut')].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                    >
                      {item}
                    </button>
                  ))}
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
export type { TopbarProps }
