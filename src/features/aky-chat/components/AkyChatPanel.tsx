import { PanelLeftOpen } from "lucide-react"

import { cn } from "@/lib/utils"

import type { Dispatch, SetStateAction } from "react"
import type { CourseTheme } from "@/types/theme"

import AkyComposer from "./AkyComposer"
import AkyCourseSelectView from "./AkyCourseSelectView"
import AkyMessageList from "./AkyMessageList"
import { useAkyMessages } from "../hooks/useAkyMessages"
import type { ChatView, CourseOption, EntityId } from "../aky-chat.types"

interface AkyChatPanelProps {
  historyVisible: boolean
  setHistoryVisible: Dispatch<SetStateAction<boolean>>
  selectedTheme: CourseTheme
  courses: CourseOption[]
  selectedCourseId: EntityId | null
  setSelectedCourseId: (value: string) => void
  view: ChatView
  open: boolean
  activeCourseTitle: string | null | undefined
  enabled: boolean
  akyMessages: ReturnType<typeof useAkyMessages>
  onQuickQuestion: (questionText: string) => void
}

export default function AkyChatPanel({
  historyVisible,
  setHistoryVisible,
  selectedTheme,
  courses,
  selectedCourseId,
  setSelectedCourseId,
  view,
  open,
  activeCourseTitle,
  enabled,
  akyMessages,
  onQuickQuestion,
}: AkyChatPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-slate-50/50", view === "list" ? "hidden lg:flex" : "flex")}>
      {!historyVisible ? (
        <div className="hidden items-center border-b border-slate-100 bg-white/45 px-5 py-3 lg:flex">
          <button
            type="button"
            onClick={() => setHistoryVisible(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-[#bfd5eb] hover:bg-white hover:text-[#24385b]"
          >
            <PanelLeftOpen className="h-4 w-4" />
            Istoric
          </button>
        </div>
      ) : null}

      {!selectedCourseId ? <AkyCourseSelectView courses={courses} selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} /> : null}

      {selectedCourseId ? (
        <>
          <AkyMessageList
            messages={akyMessages.messages}
            isLoadingMessages={akyMessages.isLoadingMessages}
            hasMoreMessages={akyMessages.hasMoreMessages}
            isLoadingOlderMessages={akyMessages.isLoadingOlderMessages}
            isSending={akyMessages.isSending}
            error={akyMessages.error}
            autoScroll={open && view === "chat"}
            theme={selectedTheme}
            activeCourseTitle={activeCourseTitle}
            onLoadOlderMessages={akyMessages.loadOlderMessages}
            onQuickQuestion={onQuickQuestion}
            onRetry={akyMessages.handleRetry}
          />
          <AkyComposer
            enabled={enabled}
            selectedCourseId={selectedCourseId}
            isSending={akyMessages.isSending}
            draft={akyMessages.draft}
            setDraft={akyMessages.setDraft}
            handleSubmit={akyMessages.handleSubmit}
            accentClassName={selectedTheme.accent}
          />
        </>
      ) : null}
    </div>
  )
}
