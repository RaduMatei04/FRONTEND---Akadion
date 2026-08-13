import { AlertCircle, Loader2, Sparkles, Trash2, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatQuizDate, getScoreBadgeClasses } from "@/features/study-tools/quiz/quiz.utils"

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

export default function QuizHistorySidebar(props: QuizHistorySidebarProps) {
  const { theme, historyError, setHistoryOpen, handleResetQuiz, setHistoryError, refetchQuizHistory, isLoadingHistory, quizHistory, handleViewAttemptDetail, handleStergeQuiz } = props

  return (
    <aside className="relative z-20 flex max-h-[70vh] w-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-[#e4d8cd] bg-linear-to-b from-[#f8fafc] via-[#fffdfa] to-[#fbf6f0] shadow-[18px_22px_54px_rgba(32,46,84,0.12)] lg:h-[calc(100vh-9rem)] lg:max-h-none lg:rounded-l-none lg:rounded-r-[2rem] lg:border-l-0" aria-label="Istoric quiz">
      <div className="flex items-start justify-between gap-4 border-b border-[#e4d8cd] px-5 py-4">
        <div className="min-w-0"><h2 className="text-lg font-bold tracking-tight text-slate-900">Istoric quiz</h2></div>
        <button type="button" onClick={() => setHistoryOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e4d8cd] bg-white text-slate-500 transition hover:bg-[#f7efe6] hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20" aria-label="Închide istoricul quiz"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4 border-b border-[#e4d8cd] px-5 py-4">
        <Button type="button" onClick={() => { handleResetQuiz(); setHistoryError("") }} className={cn("w-full rounded-2xl text-white shadow-md", theme.btnPrimaryBg, theme.btnPrimaryHover)}><Sparkles className="mr-2 h-4 w-4" />Quiz nou</Button>
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">Încercări salvate</p>
          <button type="button" onClick={() => { void refetchQuizHistory() }} className="text-xs font-semibold text-slate-500 transition hover:text-[#24385b]">Reîmprospătează</button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {historyError ? <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90"><AlertCircle className="h-4 w-4 text-rose-600" /><AlertTitle>Istoric indisponibil</AlertTitle><AlertDescription>{historyError}</AlertDescription></Alert> : null}
        {isLoadingHistory ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#4A5681]" /></div> : null}
        {!isLoadingHistory && quizHistory.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-4 py-10 text-center text-sm text-slate-500">Nu ai încercări finalizate pentru acest filtru.</div> : null}
        <div className="space-y-3">
          {!isLoadingHistory && quizHistory.length > 0 ? quizHistory.map((item) => (
            <div key={item.incercareId || item.id} className="flex items-center justify-between gap-4 rounded-3xl border border-[#d9e4f4] bg-white px-4 py-4 text-left shadow-xs transition hover:border-[#bfd5eb] hover:bg-[#f4f8fd]">
              <button type="button" onClick={() => void handleViewAttemptDetail(item)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-[#24385b]">{item.documentTitlu || item.cursDenumire || "Quiz general"}</p>
                <p className="mt-1 text-xs text-slate-400">{formatQuizDate(item.createdAt)}</p>
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getScoreBadgeClasses(item.procentaj ?? 0))}>{item.scor} / {item.nrIntrebari}</span>
                <button type="button" onClick={(event) => { event.stopPropagation(); void handleStergeQuiz(item.incercareId || item.id as string | number) }} className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="Șterge încercarea"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )) : null}
        </div>
      </div>
    </aside>
  )
}
