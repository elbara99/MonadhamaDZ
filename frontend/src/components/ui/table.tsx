import { cn } from '@/lib/utils'

interface TableProps {
  className?: string
  children?: React.ReactNode
}

function Table({ className, children }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="data-table">{children}</table>
    </div>
  )
}

interface TheadProps {
  className?: string
  children?: React.ReactNode
}

function Thead({ className, children }: TheadProps) {
  return <thead className={className}>{children}</thead>
}

interface TbodyProps {
  className?: string
  children?: React.ReactNode
}

function Tbody({ className, children }: TbodyProps) {
  return <tbody className={className}>{children}</tbody>
}

interface TrProps {
  className?: string
  children?: React.ReactNode
}

function Tr({ className, children }: TrProps) {
  return <tr className={className}>{children}</tr>
}

interface ThProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

function Th({ className, children, onClick }: ThProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <th className={cn('px-4 py-3', className)}>
      <Comp
        {...(onClick ? { onClick, className: 'flex items-center gap-1 font-inherit text-inherit' } : {})}
      >
        {children}
      </Comp>
    </th>
  )
}

interface TdProps {
  className?: string
  children?: React.ReactNode
}

function Td({ className, children }: TdProps) {
  return <td className={cn('px-4 py-3.5', className)}>{children}</td>
}

export { Table, Thead, Tbody, Tr, Th, Td }
