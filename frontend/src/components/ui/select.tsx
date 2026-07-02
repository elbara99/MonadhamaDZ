import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, className, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="form-label"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pl-3 pr-3 text-surface-400 dark:text-surface-500">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'form-select w-full',
              icon && 'pr-10',
              error && 'form-input-error',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {children}
          </select>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="form-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'

export { Select }
