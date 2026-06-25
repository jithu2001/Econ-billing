import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  count?: ReactNode
  icon?: ReactNode
}

/** Consistent page title block: title (+ optional count chip) + subtitle + action. */
export function PageHeader({ title, subtitle, action, count, icon }: PageHeaderProps) {
  return (
    <div className="animate-fade-up flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
          {count}
        </div>
        {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
