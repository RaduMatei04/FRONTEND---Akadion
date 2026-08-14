import { GripVertical } from "lucide-react"

import type { PointerEvent as ReactPointerEvent } from "react"

interface AkyResizeHandleProps {
  ariaLabel: string
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  className: string
}

export default function AkyResizeHandle({ ariaLabel, onPointerDown, className }: AkyResizeHandleProps) {
  return (
    <div role="separator" aria-orientation="vertical" aria-label={ariaLabel} onPointerDown={onPointerDown} className={className}>
      <div className="flex h-14 w-3 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-300 shadow-[0_4px_12px_rgba(32,46,84,0.08)] backdrop-blur-sm transition hover:border-slate-300/90 hover:text-slate-400">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
