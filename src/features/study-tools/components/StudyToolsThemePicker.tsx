import { Check, Palette, Sparkles } from "lucide-react"
import { COURSE_THEMES } from "@/lib/courseThemes"
import { cn } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

interface StudyToolsThemePickerProps {
  currentTheme: CourseTheme
  isOpen: boolean
  setIsOpen: (value: boolean | ((currentValue: boolean) => boolean)) => void
  onSelectTheme: (themeKey: string) => void
  buttonLabel: string
}

export default function StudyToolsThemePicker({ currentTheme, isOpen, setIsOpen, onSelectTheme, buttonLabel }: StudyToolsThemePickerProps) {
  return (
    <>
      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-3 w-56 rounded-[1.35rem] border border-[#d9c9ff] bg-[#fbf8ff]/98 p-2.5 text-[#3a2e66] shadow-[0_18px_48px_rgba(62,42,120,0.2)] backdrop-blur-md">
          <p className="px-2 pb-2 text-[0.68rem] font-semibold tracking-[0.14em] text-[#6c5c9a] uppercase">Tema</p>
          <div className="space-y-1">
            {COURSE_THEMES.map((theme) => {
              const isSelected = theme.key === currentTheme.key

              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => onSelectTheme(theme.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-2xl border px-2 py-2 text-left text-sm font-medium transition",
                    isSelected ? "border-[#7650d8] bg-[#f3edff] text-[#6840c5]" : "border-transparent hover:bg-white/80",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-5 w-5 shrink-0 rounded-full", theme.swatch)} />
                    <span className="whitespace-nowrap">{theme.label}</span>
                  </span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0 opacity-0" />}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={buttonLabel}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border bg-white shadow-sm transition hover:bg-[#fbf6f0]", currentTheme.btnIconBorder, currentTheme.btnIconText)}
      >
        <Palette className="h-4 w-4" />
      </button>
    </>
  )
}
