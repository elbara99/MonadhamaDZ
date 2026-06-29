import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end'
  className?: string
  menuClassName?: string
}

const itemVariants = {
  default:
    'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
  danger:
    'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/50',
} as const

function Dropdown({
  trigger,
  items,
  align = 'start',
  className,
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setFocusedIndex(-1)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, close])

  useEffect(() => {
    if (open && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector<HTMLButtonElement>(
        'button:not(:disabled)',
      )
      firstFocusable?.focus()
    }
  }, [open])

  function handleKeyDown(e: KeyboardEvent) {
    const enabledItems = items.filter((item) => !item.disabled)
    let idx = focusedIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        idx = idx < enabledItems.length - 1 ? idx + 1 : 0
        setFocusedIndex(idx)
        break
      case 'ArrowUp':
        e.preventDefault()
        idx = idx > 0 ? idx - 1 : enabledItems.length - 1
        setFocusedIndex(idx)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && enabledItems[focusedIndex]) {
          enabledItems[focusedIndex].onClick?.()
          close()
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
            className={cn(
              'absolute z-50 mt-1.5 min-w-[12rem] overflow-hidden rounded-xl border border-surface-200 bg-white p-1 shadow-lg dark:border-surface-700 dark:bg-surface-900',
              align === 'end' ? 'right-0' : 'left-0',
              menuClassName,
            )}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  close()
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40',
                  itemVariants[item.variant || 'default'],
                  focusedIndex === index && 'ring-1 ring-primary-500/30',
                )}
              >
                {item.icon && (
                  <span className="flex h-4 w-4 items-center justify-center text-surface-400 dark:text-surface-500">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Dropdown, type DropdownProps, type DropdownItem }
