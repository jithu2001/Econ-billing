import { type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  hint?: string
  action?: ReactNode
}

/** Friendly empty placeholder: soft icon medallion + warm copy. */
export function EmptyState({ icon: Icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div
        className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'hsl(var(--muted))' }}
      >
        <Icon className="h-8 w-8" style={{ color: 'hsl(var(--primary))', opacity: 0.7 }} />
      </div>
      <p className="font-medium text-gray-800">{title}</p>
      {hint && <p className="max-w-sm text-sm text-gray-400">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
