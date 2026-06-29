import { forwardRef, type TableHTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => {
    return (
      <div className={cn('w-full overflow-auto', wrapperClassName)}>
        <table
          ref={ref}
          className={cn(
            'w-full caption-bottom text-sm',
            className,
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  },
)
Table.displayName = 'Table'

interface TableHeaderProps extends TableHTMLAttributes<HTMLTableSectionElement> {
  className?: string
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          '[&_tr]:border-b [&_tr]:border-surface-200 dark:[&_tr]:border-surface-800',
          className,
        )}
        {...props}
      >
        {children}
      </thead>
    )
  },
)
TableHeader.displayName = 'TableHeader'

interface TableBodyProps extends TableHTMLAttributes<HTMLTableSectionElement> {
  className?: string
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn(
          '[&_tr:last-child]:border-0',
          className,
        )}
        {...props}
      >
        {children}
      </tbody>
    )
  },
)
TableBody.displayName = 'TableBody'

interface TableRowProps extends TableHTMLAttributes<HTMLTableRowElement> {
  className?: string
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-surface-200 transition-colors duration-150 hover:bg-surface-50/50 dark:border-surface-800 dark:hover:bg-surface-800/50',
          className,
        )}
        {...props}
      >
        {children}
      </tr>
    )
  },
)
TableRow.displayName = 'TableRow'

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => {
    const content = (
      <>
        {children}
        {sortable && (
          <span className="ml-1.5 inline-flex">
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary-500" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary-500" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-surface-400" />
            )}
          </span>
        )}
      </>
    )

    return (
      <th
        ref={ref}
        className={cn(
          'h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400',
          sortable && 'cursor-pointer select-none hover:text-surface-700 dark:hover:text-surface-200',
          className,
        )}
        onClick={sortable ? onSort : undefined}
        aria-sort={
          sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : undefined
        }
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            className="inline-flex items-center"
            onClick={onSort}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </th>
    )
  },
)
TableHead.displayName = 'TableHead'

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  className?: string
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-3 align-middle text-sm text-surface-700 dark:text-surface-300',
          className,
        )}
        {...props}
      >
        {children}
      </td>
    )
  },
)
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
export type { TableProps, TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps, TableCellProps }
