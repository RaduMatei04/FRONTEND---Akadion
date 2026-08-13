import { Check, Loader2, RotateCcw, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getQuizOptionEntries, quizAnswerMatchesOption } from "@/features/study-tools/quiz/quiz.utils"

import type { QuizQuestionRecord, QuizResultRecord } from "@/features/study-tools/quiz/quiz.types"
import type { CourseTheme } from "@/types/theme"

interface QuizLiveAttemptViewProps {
  theme: CourseTheme
  quizMode: string
  quizQuestions: QuizQuestionRecord[]
  quizResult: QuizResultRecord | null
  currentQuestionIndex: number
  answeredCount: number
  timeLeft: number
  currentQuestion: QuizQuestionRecord
  answeredQuestions: Record<number, { selectedOption: string }>
  isQuizReadyToFinalize: boolean
  isFinalizing: boolean
  handleAnswerClick: (optionKey: string) => void
  handleResetQuiz: () => void
  handleFinalizeQuiz: () => Promise<void>
  setCurrentQuestionIndex: (value: number | ((currentValue: number) => number)) => void
}

export default function QuizLiveAttemptView(props: QuizLiveAttemptViewProps) {
  const {
    theme,
    quizMode,
    quizQuestions,
    quizResult,
    currentQuestionIndex,
    answeredCount,
    timeLeft,
    currentQuestion,
    answeredQuestions,
    isQuizReadyToFinalize,
    isFinalizing,
    handleAnswerClick,
    handleResetQuiz,
    handleFinalizeQuiz,
    setCurrentQuestionIndex,
  } = props

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", theme.sectionLabel)}>Întrebarea {currentQuestionIndex + 1} din {quizQuestions.length}</p>
          <p className="text-sm text-slate-500">Răspunsuri selectate: {answeredCount} / {quizQuestions.length}</p>
        </div>
        {quizMode === "EXAMEN" && !quizResult ? (
          <div className={cn("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold", timeLeft <= 10 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
            <Timer className="h-4 w-4" />
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</span>
          </div>
        ) : null}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full bg-linear-to-r transition-all duration-300", theme.accent)} style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }} />
      </div>

      {quizResult ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-6 text-center shadow-[0_12px_28px_rgba(16,185,129,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Quiz finalizat</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{quizResult.scor} / {quizResult.nrIntrebari}</p>
          <p className="mt-1 text-sm text-emerald-800">Procentaj: {quizResult.procentaj}%</p>
        </div>
      ) : null}

      <div className={cn("rounded-3xl border p-6 sm:p-7", theme.heroBorder, theme.heroBg)}>
        <p className={cn("text-xl font-semibold leading-8", theme.sectionTitle)}>{currentQuestion.intrebare}</p>
      </div>

      <div className="space-y-4">
        {getQuizOptionEntries(currentQuestion.optiuni).map(([key, value]) => {
          const selectedOption = answeredQuestions[currentQuestionIndex]?.selectedOption
          const questionFeedback = quizResult?.detalii?.[currentQuestionIndex]
          const isSelected = quizAnswerMatchesOption(selectedOption, key, value)
          const isCorrect = quizAnswerMatchesOption(questionFeedback?.raspunsCorect, key, value)

          return (
            <button key={key} type="button" disabled={Boolean(quizResult)} onClick={() => handleAnswerClick(key)} className={cn("flex w-full items-start gap-4 rounded-3xl border px-5 py-[1.15rem] text-left transition", !quizResult && isSelected ? cn(theme.heroBorder, theme.heroBg) : "border-[#d9e4f4] bg-white hover:border-[#bfd5eb] hover:bg-[#f4f8fd]", quizResult && isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : null, quizResult && isSelected && !isCorrect ? "border-rose-200 bg-rose-50 text-rose-900" : null)}>
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold", isSelected ? cn(theme.btnPrimaryBg, "border-transparent text-white") : "border-[#d9e4f4] bg-[#fbfdff] text-[#24385b]")}>{key}</span>
              <span className="flex-1 text-sm leading-7">{value}</span>
              {quizResult && isCorrect ? <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" /> : null}
            </button>
          )
        })}
      </div>

      {quizResult?.detalii?.[currentQuestionIndex]?.explicatie ? (
        <div className="rounded-3xl border border-[#d9e4f4] bg-[#f4f8fd] px-5 py-4 text-sm leading-7 text-slate-600">
          <span className="font-semibold text-[#24385b]">Explicație: </span>
          {quizResult.detalii[currentQuestionIndex].explicatie}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="button" variant="outline" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex((currentValue) => currentValue - 1)} className="rounded-2xl border-[#d9ccbe] bg-white">Înapoi</Button>
        {currentQuestionIndex < quizQuestions.length - 1 ? <Button type="button" onClick={() => setCurrentQuestionIndex((currentValue) => currentValue + 1)} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>Următoarea</Button> : null}
      </div>

      {isQuizReadyToFinalize ? (
        <div className={cn("rounded-3xl border px-5 py-5", theme.heroBorder, theme.heroBg)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", theme.sectionLabel)}>Quiz completat</p>
              <p className={cn("mt-1 text-base font-semibold", theme.sectionTitle)}>Ai răspuns la toate întrebările.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleResetQuiz} className="rounded-2xl border-[#d9ccbe] bg-white px-5"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
              <Button type="button" onClick={() => void handleFinalizeQuiz()} disabled={isFinalizing} className={cn("rounded-2xl px-6 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>{isFinalizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Finalizează quiz</Button>
            </div>
          </div>
        </div>
      ) : null}

      {quizResult ? (
        <div className="flex justify-end pt-1">
          <Button type="button" variant="outline" onClick={handleResetQuiz} className="rounded-2xl border-[#d9ccbe] bg-white px-5"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
        </div>
      ) : null}
    </>
  )
}
