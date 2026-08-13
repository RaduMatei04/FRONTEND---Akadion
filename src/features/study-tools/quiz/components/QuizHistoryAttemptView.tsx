import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getQuizOptionEntries, quizAnswerMatchesOption } from "@/features/study-tools/quiz/quiz.utils"

import type { QuizAttemptDetail, QuizQuestionRecord } from "@/features/study-tools/quiz/quiz.types"
import type { CourseTheme } from "@/types/theme"

interface QuizHistoryAttemptViewProps {
  theme: CourseTheme
  selectedHistoryAttempt: QuizAttemptDetail
  currentQuestionIndex: number
  currentQuestion: QuizQuestionRecord | undefined
  isLoadingHistoryDetail: boolean
  setCurrentQuestionIndex: (value: number | ((currentValue: number) => number)) => void
}

export default function QuizHistoryAttemptView({ theme, selectedHistoryAttempt, currentQuestionIndex, currentQuestion, isLoadingHistoryDetail, setCurrentQuestionIndex }: QuizHistoryAttemptViewProps) {
  return (
    <>
      <div className="space-y-1">
        <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", theme.sectionLabel)}>Istoric selectat</p>
        <p className="text-sm text-slate-500">Întrebarea {currentQuestionIndex + 1} din {selectedHistoryAttempt.nrIntrebari}</p>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Rezultat</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-900">{selectedHistoryAttempt.scor} / {selectedHistoryAttempt.nrIntrebari}</p>
        <p className="mt-1 text-sm text-emerald-800">Procentaj: {selectedHistoryAttempt.procentaj}%</p>
      </div>

      {isLoadingHistoryDetail ? (
        <div className="flex justify-center py-10">
          <Loader2 className={cn("h-6 w-6 animate-spin", theme.iconText)} />
        </div>
      ) : currentQuestion ? (
        <>
          <div className={cn("rounded-3xl border p-6 sm:p-7", theme.heroBorder, theme.heroBg)}>
            <p className={cn("text-xl font-semibold leading-8", theme.sectionTitle)}>{currentQuestionIndex + 1}. {currentQuestion.intrebare}</p>
          </div>

          <div className="space-y-3.5">
            {getQuizOptionEntries(currentQuestion.optiuni).map(([key, value]) => {
              const isCorrect = quizAnswerMatchesOption(currentQuestion.raspunsCorect, key, value)
              const isSelected = quizAnswerMatchesOption(currentQuestion.raspunsStudent, key, value)

              return (
                <div key={key} className={cn("rounded-3xl border px-5 py-4 text-sm leading-7", isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-[#d9e4f4] bg-white text-slate-700", isSelected && !isCorrect ? "border-rose-200 bg-rose-50 text-rose-900" : null)}>
                  <span className="font-semibold">{key}. </span>
                  {value}
                </div>
              )
            })}
          </div>

          {currentQuestion.explicatie ? (
            <div className="rounded-3xl border border-[#d9e4f4] bg-[#f4f8fd] px-5 py-4 text-sm leading-7 text-slate-600">
              <span className="font-semibold text-[#24385b]">Explicație: </span>
              {currentQuestion.explicatie}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex((currentValue) => currentValue - 1)} className="rounded-2xl border-[#d9ccbe] bg-white">Înapoi</Button>
            {currentQuestionIndex < (selectedHistoryAttempt.detalii?.length ?? 0) - 1 ? <Button type="button" onClick={() => setCurrentQuestionIndex((currentValue) => currentValue + 1)} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>Următoarea</Button> : null}
          </div>
        </>
      ) : null}
    </>
  )
}
