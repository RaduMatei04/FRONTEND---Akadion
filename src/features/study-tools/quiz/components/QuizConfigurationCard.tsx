import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { QUIZ_DIFFICULTY_OPTIONS, QUIZ_MODE_OPTIONS, QUIZ_QUESTION_COUNT_OPTIONS } from "@/features/study-tools/quiz/quiz.constants"

import type { CourseTheme } from "@/types/theme"
import type { AccessibleDocument, CourseOption } from "@/features/study-tools/quiz/quiz.types"

interface QuizConfigurationCardProps {
  theme: CourseTheme
  selectedCourseId: string
  setSelectedCourseId: (value: string) => void
  courses: CourseOption[]
  selectedQuizDocId: string
  setSelectedQuizDocId: (value: string) => void
  accessibleDocuments: AccessibleDocument[]
  quizNumQuestions: number
  setQuizNumQuestions: (value: number) => void
  quizDifficulty: string
  setQuizDifficulty: (value: string) => void
  quizMode: string
  setQuizMode: (value: string) => void
  isLoadingDocs: boolean
  isPending: boolean
  onStart: () => Promise<void>
  quizError: string
}

export default function QuizConfigurationCard(props: QuizConfigurationCardProps) {
  const {
    theme,
    selectedCourseId,
    setSelectedCourseId,
    courses,
    selectedQuizDocId,
    setSelectedQuizDocId,
    accessibleDocuments,
    quizNumQuestions,
    setQuizNumQuestions,
    quizDifficulty,
    setQuizDifficulty,
    quizMode,
    setQuizMode,
    isLoadingDocs,
    isPending,
    onStart,
    quizError,
  } = props

  return (
    <Card className="relative w-full overflow-visible rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardContent className="space-y-7 px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-4">
            <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.6rem] bg-linear-to-br text-white shadow-[0_14px_32px_rgba(32,46,84,0.16)]", theme.accent)}>
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <p className={cn("text-sm font-semibold uppercase tracking-[0.22em]", theme.sectionLabel)}>Configurare Quiz</p>
              <h2 className={cn("mt-1 text-[2rem] font-semibold leading-tight", theme.sectionTitle)}>Quiz Aky</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-2 xl:col-span-3">
            <label htmlFor="quiz-course" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Curs</label>
            <select id="quiz-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20">
              <option value="">Selectează cursul...</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.denumire}</option>)}
            </select>
          </div>

          <div className="space-y-2 xl:col-span-3">
            <label htmlFor="quiz-doc" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Document</label>
            <select id="quiz-doc" value={selectedQuizDocId} onChange={(event) => setSelectedQuizDocId(event.target.value)} disabled={isPending || isLoadingDocs || !selectedCourseId} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20 disabled:opacity-60">
              <option value="">Toate documentele accesibile</option>
              {accessibleDocuments.map((document) => <option key={document.documentId} value={document.documentId}>{document.numeFisier}</option>)}
            </select>
          </div>

          <div className="space-y-2 md:col-span-1 xl:col-span-2">
            <label htmlFor="quiz-questions" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Întrebări</label>
            <select id="quiz-questions" value={quizNumQuestions} onChange={(event) => setQuizNumQuestions(Number(event.target.value))} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20">
              {QUIZ_QUESTION_COUNT_OPTIONS.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </div>

          <div className="space-y-2 md:col-span-1 xl:col-span-2">
            <label htmlFor="quiz-difficulty" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Dificultate</label>
            <select id="quiz-difficulty" value={quizDifficulty} onChange={(event) => setQuizDifficulty(event.target.value)} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20">
              {QUIZ_DIFFICULTY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-2">
            <label htmlFor="quiz-mode" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mod</label>
            <select id="quiz-mode" value={quizMode} onChange={(event) => setQuizMode(event.target.value)} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20">
              {QUIZ_MODE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="button" onClick={() => void onStart()} disabled={isPending || !selectedCourseId} className={cn("min-w-[13rem] rounded-2xl px-6 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generează quiz
          </Button>
        </div>

        {quizError ? (
          <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <AlertTitle>Quiz indisponibil</AlertTitle>
            <AlertDescription>{quizError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
