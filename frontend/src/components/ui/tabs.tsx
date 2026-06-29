import { useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type TabStyle = 'underline' | 'pill'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  defaultTab?: string
  onChange?: (tabId: string) => void
  style?: TabStyle
  className?: string
  children?: (activeTabId: string) => ReactNode
}

function Tabs({
  tabs,
  activeTab: controlledActive,
  defaultTab,
  onChange,
  style = 'underline',
  className,
  children,
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(
    defaultTab || tabs[0]?.id || '',
  )
  const isControlled = controlledActive !== undefined
  const activeTab = isControlled ? controlledActive : internalActive

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (!isControlled) setInternalActive(tabId)
      onChange?.(tabId)
    },
    [isControlled, onChange],
  )

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex',
          style === 'underline'
            ? 'border-b border-surface-200 dark:border-surface-800 gap-0'
            : 'gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl',
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
                style === 'underline'
                  ? 'px-4 py-2.5 text-sm -mb-px'
                  : 'px-4 py-2 text-sm rounded-lg',
                isActive
                  ? style === 'underline'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-900 dark:text-surface-100'
                  : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
              )}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {style === 'underline' && isActive && (
                <motion.span
                  layoutId="tab-indicator-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
      {style === 'pill' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {children?.(activeTab)}
          </motion.div>
        </AnimatePresence>
      )}
      {style === 'underline' && children?.(activeTab)}
    </div>
  )
}

export { Tabs, type TabsProps, type Tab, type TabStyle }
