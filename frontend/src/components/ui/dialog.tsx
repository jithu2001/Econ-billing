import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)

  // Escape closes; focus is trapped inside while open and restored on close.
  React.useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement

    const focusFirst = () => {
      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      focusables?.[0]?.focus()
    }
    // Defer so the content is mounted before focusing.
    const raf = requestAnimationFrame(focusFirst)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onOpenChange(false)
        return
      }
      if (e.key !== "Tab") return

      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    // Lock background scroll while the modal is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="modal-overlay fixed inset-0"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={containerRef}
        className="relative z-50 my-auto max-h-[88vh] w-full max-w-lg overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "modal-content relative rounded-2xl border bg-white p-6 shadow-2xl",
      className
    )}
    style={{ boxShadow: "0 24px 60px hsla(25, 40%, 18%, 0.22)" }}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = "DialogContent"

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-5 flex flex-col space-y-1 pr-8", className)}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold tracking-tight text-gray-900", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky bottom-0 -mx-6 -mb-6 mt-6 flex justify-end gap-2 border-t bg-white px-6 py-4",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onClose?: () => void }
>(({ className, onClose, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Close dialog"
    className={cn(
      "absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
      className
    )}
    onClick={onClose}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
))
DialogClose.displayName = "DialogClose"
