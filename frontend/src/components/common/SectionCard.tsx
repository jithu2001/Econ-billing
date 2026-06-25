import { type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  iconTint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Standard white panel (`.card`) with an optional titled header + action. */
export function SectionCard({
  title, subtitle, icon: Icon, iconTint, action, children, className, bodyClassName,
}: SectionCardProps) {
  return (
    <div className={cn('card', className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="rounded-lg p-2" style={{ background: iconTint || 'hsl(var(--muted))' }}>
                <Icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
              </div>
            )}
            <div>
              {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}
