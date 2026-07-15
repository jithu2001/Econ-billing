import { Minus, Square, X, Mountain } from 'lucide-react'
import { AppAPI } from '@/lib/bindings'

// Wails frameless drag region is opted into via the `--wails-draggable` CSS
// custom property. The bar drags the window; the buttons opt back out.
const drag = { '--wails-draggable': 'drag' } as React.CSSProperties
const noDrag = { '--wails-draggable': 'no-drag' } as React.CSSProperties

export default function TitleBar() {
  return (
    <div
      style={{ ...drag, background: 'hsl(25 30% 18%)' }}
      className="flex h-9 shrink-0 select-none items-center justify-between text-amber-50/90"
    >
      <div className="flex items-center gap-2 px-3">
        <Mountain className="h-3.5 w-3.5 text-amber-300/80" />
        <span className="text-sm font-semibold tracking-wide">Econ</span>
      </div>
      <div style={noDrag} className="flex items-center gap-1 pr-2">
        <button
          onClick={() => AppAPI.MinimizeWindow()}
          aria-label="Minimize"
          className="flex h-6 w-7 items-center justify-center rounded-md text-amber-50/70 transition-colors hover:bg-white/10 hover:text-amber-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => AppAPI.MaximizeWindow()}
          aria-label="Maximize"
          className="flex h-6 w-7 items-center justify-center rounded-md text-amber-50/70 transition-colors hover:bg-white/10 hover:text-amber-50"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={() => AppAPI.CloseWindow()}
          aria-label="Close"
          className="flex h-6 w-7 items-center justify-center rounded-md text-amber-50/70 transition-colors hover:text-white"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(5 70% 55%)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
