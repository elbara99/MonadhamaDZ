import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

const alertStyles = {
  info: { container: 'alert-info', icon: Info },
  success: { container: 'alert-success', icon: CheckCircle2 },
  warning: { container: 'alert-warning', icon: AlertTriangle },
  danger: { container: 'alert-danger', icon: AlertCircle },
}

interface AlertProps {
  variant?: keyof typeof alertStyles
  className?: string
  children?: ReactNode
  icon?: boolean
}

function Alert({
  variant = 'info',
  className,
  children,
  icon = true,
}: AlertProps) {
  const config = alertStyles[variant]
  const Icon = config.icon

  return (
    <div className={cn(config.container, className)} role="alert">
      {icon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
      <div>{children}</div>
    </div>
  )
}

export { Alert }
