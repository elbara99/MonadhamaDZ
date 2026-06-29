import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

function useRTLIcon(LTRIcon: LucideIcon, RTLIcon: LucideIcon) {
  return function RTLAdaptiveIcon(props: LucideProps) {
    const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr'
    const Icon = dir === 'rtl' ? RTLIcon : LTRIcon
    return <Icon {...props} />
  }
}

export const ArrowBack = useRTLIcon(ArrowLeft, ArrowRight)
export const ArrowForward = useRTLIcon(ArrowRight, ArrowLeft)
export const ChevronBack = useRTLIcon(ChevronLeft, ChevronRight)
export const ChevronForward = useRTLIcon(ChevronRight, ChevronLeft)

export { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight }
