import { Minus, Square, X } from 'lucide-react'
import { AppAPI } from '@/lib/bindings'

// Wails frameless drag region is opted into via the `--wails-draggable` CSS
// custom property. The bar drags the window; the buttons opt back out.
const drag = { '--wails-draggable': 'drag' } as React.CSSProperties
const noDrag = { '--wails-draggable': 'no-drag' } as React.CSSProperties

export default function TitleBar() {
  return (
    <div
      style={drag}
      className="flex items-center justify-between h-9 shrink-0 bg-white border-b border-gray-200 select-none"
    >
      <div className="px-3 text-sm font-semibold text-gray-700 tracking-wide">Econ</div>
      <div style={noDrag} className="flex items-stretch h-full">
        <button
          onClick={() => AppAPI.MinimizeWindow()}
          aria-label="Minimize"
          className="flex items-center justify-center w-11 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => AppAPI.MaximizeWindow()}
          aria-label="Maximize"
          className="flex items-center justify-center w-11 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => AppAPI.CloseWindow()}
          aria-label="Close"
          className="flex items-center justify-center w-11 text-gray-600 hover:bg-red-600 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
