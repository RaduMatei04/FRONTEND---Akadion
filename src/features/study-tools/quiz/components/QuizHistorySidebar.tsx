import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatQuizDate, getScoreBadgeStyle } from "@/features/study-tools/quiz/quiz.utils"

import type { QuizAttemptHistoryItem } from "@/features/study-tools/quiz/quiz.types"
import type { CourseTheme } from "@/types/theme"

interface QuizHistorySidebarProps {
  theme: CourseTheme
  historyError: string
  setHistoryOpen: (value: boolean) => void
  handleResetQuiz: () => void
  setHistoryError: (value: string) => void
  refetchQuizHistory: () => Promise<unknown>
  isLoadingHistory: boolean
  quizHistory: QuizAttemptHistoryItem[]
  handleViewAttemptDetail: (item: QuizAttemptHistoryItem | string | number) => Promise<void>
  handleStergeQuiz: (incercareId: string | number) => Promise<void>
}

const QUIZ_HISTORY_PAGE_SIZE = 5

export default function QuizHistorySidebar(props: QuizHistorySidebarProps) {
  const { theme, historyError, setHistoryOpen, handleResetQuiz, setHistoryError, refetchQuizHistory, isLoadingHistory, quizHistory, handleViewAttemptDetail, handleStergeQuiz } = props
  const [currentPage, setCurrentPage] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const totalPages = Math.max(1, Math.ceil(quizHistory.length / QUIZ_HISTORY_PAGE_SIZE))

  useEffect(() => {
    setCurrentPage((currentValue) => Math.min(Math.max(currentValue, 1), totalPages))
  }, [totalPages])

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" })
  }, [currentPage])

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * QUIZ_HISTORY_PAGE_SIZE
    return quizHistory.slice(startIndex, startIndex + QUIZ_HISTORY_PAGE_SIZE)
  }, [currentPage, quizHistory])

  const pageStart = quizHistory.length === 0 ? 0 : (currentPage - 1) * QUIZ_HISTORY_PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * QUIZ_HISTORY_PAGE_SIZE, quizHistory.length)

  return (
    <aside className="relative z-20 flex max-h-[70vh] w-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-[#e4d8cd] bg-linear-to-b from-[#f8fafc] via-[#fffdfa] to-[#fbf6f0] shadow-[18px_22px_54px_rgba(32,46,84,0.12)] lg:h-[calc(100vh-9rem)] lg:max-h-none lg:rounded-l-none lg:rounded-r-[2rem] lg:border-l-0" aria-label="Istoric quiz">
      <div className="flex items-start justify-between gap-4 border-b border-[#e4d8cd] px-5 py-4">
        <div className="min-w-0"><h2 className="text-lg font-bold tracking-tight text-slate-900">Istoric quiz</h2></div>
        <button type="button" onClick={() => setHistoryOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e4d8cd] bg-white text-slate-500 transition hover:bg-[#f7efe6] hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20" aria-label="Închide istoricul quiz"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4 border-b border-[#e4d8cd] px-5 py-4">
        <Button type="button" onClick={() => { handleResetQuiz(); setHistoryError("") }} className={cn("w-full rounded-2xl text-white shadow-md", theme.btnPrimaryBg, theme.btnPrimaryHover)}>Quiz nou</Button>
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">Încercări salvate</p>
          <button type="button" onClick={() => { void refetchQuizHistory() }} className="text-xs font-semibold text-slate-500 transition hover:text-[#24385b]">Reîmprospătează</button>
        </div>
      </div>

      <div className="min-h-0 flex flex-1 flex-col px-4 py-4">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
          {historyError ? <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90"><AlertCircle className="h-4 w-4 text-rose-600" /><AlertTitle>Istoric indisponibil</AlertTitle><AlertDescription>{historyError}</AlertDescription></Alert> : null}
          {isLoadingHistory ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#4A5681]" /></div> : null}
          {!isLoadingHistory && quizHistory.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-4 py-10 text-center text-sm text-slate-500">Nu ai încercări finalizate pentru acest filtru.</div> : null}
          <div className="space-y-3">
            {!isLoadingHistory && quizHistory.length > 0 ? paginatedHistory.map((item) => (
            <div key={item.incercareId || item.id} className="flex items-center justify-between gap-4 rounded-3xl border border-[#d9e4f4] bg-white px-4 py-4 text-left shadow-xs transition hover:border-[#bfd5eb] hover:bg-[#f4f8fd]">
              <button type="button" onClick={() => void handleViewAttemptDetail(item)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-[#24385b]">{item.documentTitlu || item.cursDenumire || "Quiz general"}</p>
                <p className="mt-1 text-xs text-slate-400">{formatQuizDate(item.createdAt)}</p>
              </button>
              <div className="flex items-center gap-2">
                <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={getScoreBadgeStyle(theme.heroAccent, item.scor, item.nrIntrebari, item.procentaj)}>{item.scor} / {item.nrIntrebari}</span>
                <button type="button" onClick={(event) => { event.stopPropagation(); void handleStergeQuiz(item.incercareId || item.id as string | number) }} className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="Șterge încercarea"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            )) : null}
          </div>
        </div>

        {!isLoadingHistory && quizHistory.length > QUIZ_HISTORY_PAGE_SIZE ? (
          <div className="mt-4 border-t border-[#e4d8cd] px-1 pt-3">
            <div className="mb-2 text-center text-[11px] font-medium text-slate-400">{pageStart}–{pageEnd} din {quizHistory.length}</div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((currentValue) => Math.max(1, currentValue - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d9e4f4] bg-white text-slate-500 transition hover:border-[#bfd5eb] hover:text-[#24385b] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Pagina anterioară"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[4.75rem] text-center text-sm font-semibold text-[#24385b]">{currentPage} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((currentValue) => Math.min(totalPages, currentValue + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d9e4f4] bg-white text-slate-500 transition hover:border-[#bfd5eb] hover:text-[#24385b] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Pagina următoare"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
