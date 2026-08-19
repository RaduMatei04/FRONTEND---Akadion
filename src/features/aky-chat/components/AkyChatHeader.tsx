import { ChevronLeft } from "lucide-react"

import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import type { CourseTheme } from "@/types/theme"

import { ragHeadLogo } from "../aky-chat.constants"
import type { ChatView } from "../aky-chat.types"

interface AkyChatHeaderProps {
  selectedTheme: CourseTheme
  view: ChatView
  activeCourseTitle: string | null | undefined
  onBackToList: () => void
}

export default function AkyChatHeader({
  selectedTheme,
  view,
  activeCourseTitle,
  onBackToList,
}: AkyChatHeaderProps) {
  return (
    <SheetHeader className={`relative bg-linear-to-r ${selectedTheme.accent} text-white`}>
      <div className="absolute -top-10 right-[-2rem] h-28 w-28 rounded-full bg-white/10 blur-sm" />
      <div className="absolute -bottom-12 left-[-1.5rem] h-28 w-28 rounded-full bg-[#8bc8f1]/14 blur-sm" />

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
