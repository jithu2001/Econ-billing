import { type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'border bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'border text-[hsl(var(--status-red))] hover:bg-[hsl(var(--status-red)/0.08)]',
}

/** Primary action button with a leading icon and a built-in loading spinner. */
export function Button({
  icon: Icon, loading = false, variant = 'primary', className, children, disabled, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2"
          style={{ borderColor: 'currentColor', borderTopColor: 'transparent', opacity: 0.9 }}
        />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  )
}
