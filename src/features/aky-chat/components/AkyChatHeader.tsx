import { Check, ChevronLeft, Palette } from "lucide-react"

import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { COURSE_THEMES } from "@/lib/courseThemes"

import type { Dispatch, RefObject, SetStateAction } from "react"
import type { CourseTheme } from "@/types/theme"

import { ragHeadLogo } from "../aky-chat.constants"
import type { ChatView } from "../aky-chat.types"

interface AkyChatHeaderProps {
  selectedTheme: CourseTheme
  view: ChatView
  activeCourseTitle: string | null | undefined
  themePickerOpen: boolean
  setThemePickerOpen: Dispatch<SetStateAction<boolean>>
  themePickerRef: RefObject<HTMLDivElement | null>
  onThemeChange: (themeKey: string) => void
  onBackToList: () => void
}

export default function AkyChatHeader({
  selectedTheme,
  view,
  activeCourseTitle,
  themePickerOpen,
  setThemePickerOpen,
  themePickerRef,
  onThemeChange,
  onBackToList,
}: AkyChatHeaderProps) {
  return (
    <SheetHeader className={`relative bg-linear-to-r ${selectedTheme.accent} text-white`}>
      <div className="absolute -top-10 right-[-2rem] h-28 w-28 rounded-full bg-white/10 blur-sm" />
      <div className="absolute -bottom-12 left-[-1.5rem] h-28 w-28 rounded-full bg-[#8bc8f1]/14 blur-sm" />

      <div ref={themePickerRef} className="absolute right-16 top-4 z-20">
        {themePickerOpen ? (
          <div className="absolute right-0 top-12 w-56 rounded-[1.35rem] border border-[#d9c9ff] bg-[#fbf8ff]/98 p-2.5 text-[#3a2e66] shadow-[0_18px_48px_rgba(62,42,120,0.2)] backdrop-blur-md">
            <p className="px-2 pb-2 text-[0.68rem] font-semibold tracking-[0.14em] text-[#6c5c9a] uppercase">Tema</p>
            <div className="space-y-1">
              {COURSE_THEMES.map((theme) => {
                const isSelected = theme.key === selectedTheme.key

                return (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => onThemeChange(theme.key)}
                    className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-2 py-2 text-left text-sm font-medium transition ${isSelected ? "border-[#7650d8] bg-[#f3edff] text-[#6840c5]" : "border-transparent hover:bg-white/80"}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`h-5 w-5 shrink-0 rounded-full ${theme.swatch}`} />
                      <span className="whitespace-nowrap">{theme.label}</span>
                    </span>
                    {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          aria-label="Schimbă tema Aky"
          onClick={() => setThemePickerOpen((currentValue) => !currentValue)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/32 bg-white/16 text-white shadow-[0_10px_22px_rgba(15,23,42,0.14)] backdrop-blur-sm transition hover:bg-white/24"
        >
          <Palette className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 pr-12 relative z-10 pt-2 pb-1">
        {view === "chat" && (
          <button
            onClick={onBackToList}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/12 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_10px_22px_rgba(15,23,42,0.16)]">
            <img src={ragHeadLogo} alt="Aky" className="h-7 w-7 object-contain" />
          </div>
        </div>

        <div className="min-w-0">
          <SheetTitle className="text-white text-lg">Aky</SheetTitle>
          <SheetDescription className="mt-0.5 truncate text-white/80 text-sm">
            {activeCourseTitle ? `Asistent: ${activeCourseTitle}` : "Chatbot Akadion"}
          </SheetDescription>
        </div>
      </div>
    </SheetHeader>
  )
}
