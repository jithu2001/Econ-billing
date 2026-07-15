import { cn } from '@/lib/utils'

type Variant = 'green' | 'blue' | 'amber' | 'red' | 'stone'

const STATUS_VARIANT: Record<string, Variant> = {
  // green — active / paid / available
  ACTIVE: 'green', PAID: 'green', AVAILABLE: 'green', CHECKED_IN: 'green',
  // blue — confirmed / occupied / finalized
  CONFIRMED: 'blue', FINALIZED: 'blue', OCCUPIED: 'blue',
  // amber — pending / maintenance
  MAINTENANCE: 'amber', PENDING: 'amber',
  // red — unpaid / cancelled
  UNPAID: 'red', CANCELLED: 'red',
  // stone — draft / neutral / completed
  DRAFT: 'stone', COMPLETED: 'stone', CHECKED_OUT: 'stone',
}

// Live states get a gently pulsing dot.
const PULSE = new Set(['ACTIVE', 'OCCUPIED'])

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT[status] ?? 'stone'
  const label = status.replace(/_/g, ' ')
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      <span
        className={cn('badge-dot', `badge-dot-${variant}`, PULSE.has(status) && 'status-dot-active')}
      />
      {label}
    </span>
  )
}
