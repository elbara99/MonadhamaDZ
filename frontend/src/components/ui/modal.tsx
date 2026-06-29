import { useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnOverlay?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw]',
} as const

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  closeOnOverlay = true,
  size = 'md',
}: ModalProps) {
  const { t } = useTranslation()
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full rounded-2xl bg-white p-6 shadow-modal dark:bg-surface-900',
              sizeClasses[size],
              className,
            )}
          >
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {title && (
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                {description}
              </p>
            )}
            {children && <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { Modal, type ModalProps }
