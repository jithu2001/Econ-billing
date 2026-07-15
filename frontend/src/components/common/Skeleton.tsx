import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

/** Pulsing placeholder rows for a table while data loads. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={cn('h-5', c === 0 ? 'w-44' : 'flex-1')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Pulsing placeholder grid for stat cards. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
