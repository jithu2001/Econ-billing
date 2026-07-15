import { type LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Accent = 'primary' | 'green' | 'blue' | 'amber' | 'red' | 'stone'

const ACCENT: Record<Accent, string> = {
  primary: 'hsl(var(--primary))',
  green: 'hsl(var(--status-green))',
  blue: 'hsl(var(--status-blue))',
  amber: 'hsl(var(--status-amber))',
  red: 'hsl(var(--status-red))',
  stone: 'hsl(var(--status-stone))',
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: Accent
  hint?: string
  trend?: string
  hero?: boolean
  onClick?: () => void
  index?: number
}

/**
 * White card with a colored left-border accent, a faint watermark icon,
 * and a count-up number. Clickable when given an onClick.
 */
export function StatCard({
  label, value, icon: Icon, accent = 'stone', hint, trend, hero, onClick, index = 0,
}: StatCardProps) {
  const color = ACCENT[accent]
  const clickable = !!onClick

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        'card relative overflow-hidden',
        clickable && 'card-hover cursor-pointer'
      )}
      style={{ borderLeft: `4px solid ${color}`, ['--i' as string]: index }}
    >
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 -top-1 h-16 w-16"
        style={{ color, opacity: 0.08 }}
      />
      <p className="col-label mb-1.5">{label}</p>
      <p
        className={cn('stat-value font-bold tabular-nums leading-none', hero ? 'text-4xl' : 'text-[28px]')}
        style={{ color: hero ? color : 'hsl(var(--foreground))' }}
      >
        {value}
      </p>
      {(hint || trend) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          {trend && (
            <span className="inline-flex items-center gap-0.5 font-medium" style={{ color: 'hsl(var(--status-green))' }}>
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  )
}
