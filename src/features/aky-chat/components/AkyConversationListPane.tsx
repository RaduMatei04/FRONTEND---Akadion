import { ChevronLeft, Loader2, MessageCircle, PanelLeftClose, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { MouseEvent, UIEvent } from "react"
import type { CourseTheme } from "@/types/theme"
import type { CourseOption, EntityId, FilterMode } from "../aky-chat.types"

interface ConversationRecord {
  id?: EntityId
  cursId?: EntityId | null
  titlu?: string
  createdAt?: string
}

interface AkyConversationListPaneProps {
  historyVisible: boolean
  setHistoryVisible: (value: boolean) => void
  selectedTheme: CourseTheme
  handleNewConversation: () => void
  handleScrollConversations: (event: UIEvent<HTMLDivElement>) => void
  courseId: EntityId | null
  filterMode: FilterMode
  isLoadingConversations: boolean
  conversatii: ConversationRecord[]
  courses: CourseOption[]
  formatDate: (isoString: string | null | undefined) => string
  handleOpenConversation: (convId: EntityId | null | undefined, cursId?: EntityId | null) => Promise<void>
  handleDeleteConversation: (convId: EntityId | null | undefined, e: MouseEvent<HTMLButtonElement>) => Promise<void>
  hasMoreConversations: boolean
  isLoadingMoreConversations: boolean
  fetchNextPage: () => void
}

export default function AkyConversationListPane(props: AkyConversationListPaneProps) {
  const {
    historyVisible,
    setHistoryVisible,
    selectedTheme,
    handleNewConversation,
    handleScrollConversations,
    courseId,
    filterMode,
    isLoadingConversations,
    conversatii,
    courses,
    formatDate,
    handleOpenConversation,
    handleDeleteConversation,
    hasMoreConversations,
    isLoadingMoreConversations,
    fetchNextPage,
  } = props

  return (
    <div className={cn("relative min-h-0 flex-col border-r border-slate-100 bg-white/42", !historyVisible && "lg:hidden", "flex")}>
      <div className="p-6 pb-2">
        <div className="mb-3 hidden items-center justify-end lg:flex">
          <button
            type="button"
            aria-label="Închide istoricul conversațiilor"
            title="Închide istoricul"
            onClick={() => setHistoryVisible(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/60 bg-white/70 text-slate-400 transition hover:border-slate-300 hover:bg-white hover:text-[#24385b]"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={handleNewConversation} className={`w-full h-12 rounded-2xl bg-linear-to-r ${selectedTheme.accent} text-white shadow-md flex items-center justify-center gap-2`}>
          <ChevronLeft className="hidden" />
          <span>Începe o conversație nouă</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3" onScroll={handleScrollConversations}>
        <div className="px-1 pb-1">
          <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Istoric Conversații</h3>
        </div>

        {isLoadingConversations ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
        ) : conversatii.length === 0 ? (
          <div className="text-center py-8 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <MessageCircle className="h-9 w-9 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{courseId && filterMode === "course" ? "Nu ai conversații anterioare la acest curs." : "Nu ai nicio conversație anterioară."}</p>
            {courseId && filterMode === "course" ? <p className="text-xs text-slate-400 pb-1">Poți adresa prima întrebare la butonul de mai sus.</p> : null}
          </div>
        ) : (
          <div className="space-y-2">
            {conversatii.map((conv) => {
              const cursNume = courses.find((c) => String(c.id) === String(conv.cursId))?.denumire
              return (
                <div key={conv.id} onClick={() => void handleOpenConversation(conv.id, conv.cursId)} className="group relative flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-[#bfd5eb] hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-linear-to-br ${selectedTheme.accent} opacity-10`} />
                  <div className={`absolute left-4 h-10 w-10 shrink-0 flex items-center justify-center ${selectedTheme.heroStatText}`}><MessageCircle className="h-5 w-5" /></div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1e3a5f] truncate pr-8">{conv.titlu || "Conversație nouă"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-400">{formatDate(conv.createdAt)}</p>
                      {!courseId && cursNume ? <><span className="w-1 h-1 rounded-full bg-slate-300" /><p className="text-[11px] font-medium text-[#3b6ea8] truncate">{cursNume}</p></> : null}
                    </div>
                  </div>

                  <button onClick={(e) => void handleDeleteConversation(conv.id, e)} className="absolute right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Șterge conversația">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {hasMoreConversations ? (
          <div className="pt-3 pb-2 text-center">
            <Button type="button" variant="outline" size="sm" onClick={fetchNextPage} disabled={isLoadingMoreConversations} className="rounded-xl border-[#d9e4f4] text-xs font-semibold text-[#24385b] hover:bg-[#f4f8fd]">
              {isLoadingMoreConversations ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Se încarcă mai multe conversații...</> : "Încarcă mai multe conversații"}
            </Button>
          </div>
        ) : conversatii.length > 0 ? (
          <p className="pt-3 pb-2 text-center text-xs font-medium text-slate-400">— Toate cele {conversatii.length} conversații sunt afișate —</p>
        ) : null}
      </div>
    </div>
  )
}
