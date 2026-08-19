import { CircleHelp, Loader2, Menu } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import StudyToolsThemePicker from "@/features/study-tools/components/StudyToolsThemePicker"
import QuizConfigurationCard from "@/features/study-tools/quiz/components/QuizConfigurationCard"
import QuizHistoryAttemptView from "@/features/study-tools/quiz/components/QuizHistoryAttemptView"
import QuizHistorySidebar from "@/features/study-tools/quiz/components/QuizHistorySidebar"
import QuizLiveAttemptView from "@/features/study-tools/quiz/components/QuizLiveAttemptView"
import { Card, CardContent } from "@/components/ui/card"
import { getCourseTheme } from "@/lib/courseThemes"
import { cn } from "@/lib/utils"
import { useQuizController } from "@/features/study-tools/quiz/hooks/useQuizController"

export default function QuizPage() {
  const controller = useQuizController()
  const theme = getCourseTheme(controller.selectedThemeKey)

  if (!controller.isStudent) {
    return (
      <AppShell title="Quiz" description="Funcționalitatea este disponibilă doar pentru studenți.">
        <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
          <CardContent className="px-6 py-6 text-sm text-slate-600">
            Pagina de quiz este disponibilă doar utilizatorilor cu rol de student.
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Quiz Aky"
      description="Generează, finalizează și revede quiz-uri construite din documentele tale accesibile."
      heroClassName={cn("relative overflow-visible border", theme.heroBg, theme.heroBorder)}
      heroEyebrowClassName={theme.heroStatLabel}
      heroTitleClassName={theme.sectionTitle}
      heroDescriptionClassName="text-slate-600"
      sideContent={controller.historyOpen ? <QuizHistorySidebar theme={theme} historyError={controller.historyError} setHistoryOpen={controller.setHistoryOpen} handleResetQuiz={controller.handleResetQuiz} setHistoryError={controller.setHistoryError} refetchQuizHistory={controller.refetchQuizHistory} isLoadingHistory={controller.isLoadingHistory} quizHistory={controller.quizHistory} handleViewAttemptDetail={controller.handleViewAttemptDetail} handleStergeQuiz={controller.handleStergeQuiz} /> : null}
      actions={(
        <div ref={controller.themePickerRef} className="relative z-30 self-end">
          <StudyToolsThemePicker currentTheme={theme} isOpen={controller.themePickerOpen} setIsOpen={controller.setThemePickerOpen} onSelectTheme={controller.handleThemeChange} buttonLabel="Schimbă tema paginii de quiz" />
        </div>
      )}
    >
      {!controller.historyOpen ? (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
            controller.setHistoryOpen(true)
          }}
          className={cn("group fixed left-0 top-28 z-20 flex h-14 w-14 items-center justify-center rounded-r-[1.75rem] border border-l-0 bg-white/95 text-slate-700 shadow-[12px_14px_34px_rgba(32,46,84,0.14)] transition hover:w-16 hover:bg-white hover:text-slate-950 focus-visible:w-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20", theme.heroBorder)}
          aria-label="Deschide istoricul quiz"
        >
          <Menu className="h-5 w-5" />
          <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
            Deschide istoricul quiz
          </span>
        </button>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-2 lg:space-y-8">
        <QuizConfigurationCard theme={theme} selectedCourseId={controller.selectedCourseId} setSelectedCourseId={controller.setSelectedCourseId} courses={controller.courses} selectedQuizDocId={controller.selectedQuizDocId} setSelectedQuizDocId={controller.setSelectedQuizDocId} accessibleDocuments={controller.accessibleDocuments} quizNumQuestions={controller.quizNumQuestions} setQuizNumQuestions={controller.setQuizNumQuestions} quizDifficulty={controller.quizDifficulty} setQuizDifficulty={controller.setQuizDifficulty} quizMode={controller.quizMode} setQuizMode={controller.setQuizMode} isLoadingDocs={controller.isLoadingDocs} isPending={controller.generateQuizMutation.isPending} onStart={controller.handleStartQuiz} quizError={controller.quizError} />

        <Card className="w-full rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
          <CardContent className="space-y-7 px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            {controller.generateQuizMutation.isPending ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Loader2 className={cn("h-10 w-10 animate-spin", theme.iconText)} />
              </div>
            ) : null}

            {!controller.generateQuizMutation.isPending && !controller.selectedHistoryAttempt && controller.quizQuestions.length === 0 && !controller.quizError ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className={cn("flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[2rem] shadow-[0_14px_30px_rgba(32,46,84,0.08)]", theme.iconBg, theme.iconText)}>
                  <CircleHelp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Aky e gata de examen, tu?</h3>
              </div>
            ) : null}

            {!controller.generateQuizMutation.isPending && controller.selectedHistoryAttempt && !controller.currentQuestion ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className={cn("flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[2rem] shadow-[0_14px_30px_rgba(32,46,84,0.08)]", theme.iconBg, theme.iconText)}>
                  <CircleHelp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Încercarea nu mai are întrebări disponibile.</h3>
              </div>
            ) : null}

            {!controller.generateQuizMutation.isPending && !controller.selectedHistoryAttempt && controller.quizQuestions.length > 0 ? <QuizLiveAttemptView theme={theme} quizMode={controller.quizMode} quizQuestions={controller.quizQuestions} quizResult={controller.quizResult} currentQuestionIndex={controller.currentQuestionIndex} answeredCount={controller.answeredCount} timeLeft={controller.timeLeft} currentQuestion={controller.currentQuestion} answeredQuestions={controller.answeredQuestions} isQuizReadyToFinalize={controller.isQuizReadyToFinalize} isFinalizing={controller.finalizeQuizMutation.isPending} handleAnswerClick={controller.handleAnswerClick} handleResetQuiz={controller.handleResetQuiz} handleFinalizeQuiz={controller.handleFinalizeQuiz} setCurrentQuestionIndex={controller.setCurrentQuestionIndex} /> : null}

            {!controller.generateQuizMutation.isPending && controller.selectedHistoryAttempt ? <QuizHistoryAttemptView theme={theme} selectedHistoryAttempt={controller.selectedHistoryAttempt} currentQuestionIndex={controller.currentQuestionIndex} currentQuestion={controller.currentQuestion} isLoadingHistoryDetail={controller.isLoadingHistoryDetail} setCurrentQuestionIndex={controller.setCurrentQuestionIndex} /> : null}
          </CardContent>
        </Card>
      </div>

      <AkyChatWidget enabled />
    </AppShell>
  )
}
