import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
}

/** Warm amber circle with the first initial of a name. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase()
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizes[size],
        className
      )}
      style={{ background: 'hsl(var(--avatar))' }}
    >
      {initial}
    </div>
  )
}
