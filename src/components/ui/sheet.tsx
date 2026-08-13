import { X } from "lucide-react"
import { type CSSProperties, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type SheetSide = "left" | "right"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps {
  className?: string
  onOpenChange: (open: boolean) => void
  side?: SheetSide
  children: React.ReactNode
  style?: CSSProperties
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) {
    return null
  }

  return createPortal(children, document.body)
}

function SheetContent({ className, onOpenChange, side = "right", children, style }: SheetContentProps) {
  const isLeftSide = side === "left"

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Inchide"
        className="absolute inset-0 bg-slate-950/38 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 flex h-full w-full max-w-[26rem] flex-col bg-[#fffdfa]",
          isLeftSide
            ? "left-0 border-r border-[#e4d8cd] shadow-[20px_0_60px_rgba(32,46,84,0.18)]"
            : "right-0 border-l border-[#e4d8cd] shadow-[-20px_0_60px_rgba(32,46,84,0.18)]",
          className,
        )}
        style={style}
      >
        <button
          type="button"
          aria-label="Inchide"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e4d8cd] bg-white text-slate-500 transition hover:bg-[#f8f3ed] hover:text-[#24385b]"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-[#ece2d8] px-6 py-5", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-2xl font-semibold tracking-tight text-[#24385b]", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm leading-6 text-slate-500", className)} {...props} />
}

export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle }
