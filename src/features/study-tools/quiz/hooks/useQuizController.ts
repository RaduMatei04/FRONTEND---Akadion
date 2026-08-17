import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { isStudentUser } from "@/auth/user.utils"
import { useAuth } from "@/auth/useAuth"
import { listStudentCourses } from "@/features/courses/api/courses"
import { getDocumenteAccesibile } from "@/features/study-tools/quiz/api/quiz"
import { QUIZ_COURSES_QUERY_KEY } from "@/features/study-tools/quiz/quiz.constants"
import { useQuizExamTimer } from "@/features/study-tools/quiz/hooks/useQuizExamTimer"
import { useQuizGeneration } from "@/features/study-tools/quiz/hooks/useQuizGeneration"
import { useQuizHistory } from "@/features/study-tools/quiz/hooks/useQuizHistory"
import { buildQuizAnswersPayload, getQuizErrorMessage } from "@/features/study-tools/quiz/quiz.utils"
import { useStoredPageTheme } from "@/features/study-tools/lib/pageThemeStorage"

import type { AccessibleDocument, CourseOption, QuizGenerationResponse } from "@/features/study-tools/quiz/quiz.types"

export function useQuizController() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isStudent = isStudentUser(user)

  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)
  const { selectedThemeKey, setSelectedThemeKey } = useStoredPageTheme(user, "akadion:quiz-page-theme")

  const generation = useQuizGeneration()
  const history = useQuizHistory(selectedCourseId)

  const {
    selectedQuizDocId,
    setSelectedQuizDocId,
    quizNumQuestions,
    quizDifficulty,
    quizMode,
    quizQuestions,
    setQuizQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setAnsweredQuestions,
    answeredQuestions,
    currentIncercareId,
    setCurrentIncercareId,
    quizResult,
    setQuizResult,
    setQuizError,
    generateQuizMutation,
    finalizeQuizMutation,
  } = generation

  const {
    refetchQuizHistory,
    selectedHistoryAttempt,
    setSelectedHistoryAttempt,
    setHistoryError,
  } = history

  const { timeLeft, setTimeLeft } = useQuizExamTimer({
    quizMode,
    quizQuestions,
    quizResult,
    autoFinalize,
  })

  const { data: courses = [] } = useQuery<CourseOption[]>({
    queryKey: QUIZ_COURSES_QUERY_KEY,
    queryFn: listStudentCourses,
    enabled: isStudent,
  })

  const {
    data: accessibleDocuments = [],
    isLoading: isLoadingDocs,
  } = useQuery<AccessibleDocument[]>({
    queryKey: ["quiz", "documents", selectedCourseId],
    queryFn: () => getDocumenteAccesibile(selectedCourseId),
    enabled: Boolean(selectedCourseId),
  })

  const resetQuizSession = useCallback(() => {
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setAnsweredQuestions({})
    setQuizError("")
    setCurrentIncercareId(null)
    setQuizResult(null)
    setTimeLeft(0)
    setSelectedHistoryAttempt(null)
  }, [setQuizQuestions, setCurrentQuestionIndex, setAnsweredQuestions, setQuizError, setCurrentIncercareId, setQuizResult, setTimeLeft, setSelectedHistoryAttempt])

  async function finalizeQuiz(fallbackMessage: string) {
    if (!currentIncercareId || finalizeQuizMutation.isPending) {
      return
    }

    try {
      const payload = buildQuizAnswersPayload(quizQuestions, answeredQuestions)
      const response = await finalizeQuizMutation.mutateAsync({ attemptId: currentIncercareId, answers: payload })
      setQuizResult(response)
      await refetchQuizHistory()
    } catch (error: unknown) {
      setQuizError(getQuizErrorMessage(error, fallbackMessage))
    }
  }

  async function autoFinalize() {
    if (!currentIncercareId || finalizeQuizMutation.isPending) {
      return
    }

    setQuizError("Timpul a expirat. Quiz-ul se finalizează automat...")
    await finalizeQuiz("Nu s-a putut finaliza automat quiz-ul.")
  }

  function handleThemeChange(themeKey: string) {
    setSelectedThemeKey(themeKey)
    setThemePickerOpen(false)
  }

  async function handleStartQuiz() {
    if (!selectedCourseId) {
      return
    }

    resetQuizSession()

    try {
      const data = await generateQuizMutation.mutateAsync({
        courseId: selectedCourseId,
        documentId: selectedQuizDocId,
        count: quizNumQuestions,
        difficulty: quizDifficulty,
      }) as QuizGenerationResponse

      if (data?.incercareId && Array.isArray(data?.intrebari) && data.intrebari.length > 0) {
        setCurrentIncercareId(data.incercareId)
        setQuizQuestions(data.intrebari)
        return
      }

      setQuizError("Aky nu a putut genera întrebări structurate corect. Încearcă din nou.")
    } catch (error: unknown) {
      setQuizError(getQuizErrorMessage(error, "Nu am putut genera quiz-ul."))
    }
  }

  function handleAnswerClick(optionKey: string) {
    if (quizResult || selectedHistoryAttempt) {
      return
    }

    setAnsweredQuestions((currentValue) => ({
      ...currentValue,
      [currentQuestionIndex]: { selectedOption: optionKey },
    }))
  }

  async function handleFinalizeQuiz() {
    if (!currentIncercareId || finalizeQuizMutation.isPending) {
      return
    }

    setQuizError("")
    await finalizeQuiz("Nu am putut finaliza quiz-ul.")
  }

  function handleResetQuiz() {
    resetQuizSession()
  }

  useEffect(() => {
    const urlCourseId = searchParams.get("courseId")
    const urlDocId = searchParams.get("documentId")
    if (urlCourseId) {
      setSelectedCourseId(urlCourseId)
    }
    if (urlDocId) {
      setSelectedQuizDocId(urlDocId)
    }
  }, [searchParams, setSelectedQuizDocId])

  useEffect(() => {
    if (!themePickerOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (!themePickerRef.current?.contains(event.target)) {
        setThemePickerOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setThemePickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [themePickerOpen])

  useEffect(() => {
    setSelectedQuizDocId("")
    setHistoryError("")
    resetQuizSession()
  }, [selectedCourseId, setSelectedQuizDocId, setHistoryError, resetQuizSession])

  const answeredCount = Object.keys(answeredQuestions).length
  const isQuizReadyToFinalize = quizQuestions.length > 0 && answeredCount === quizQuestions.length && !quizResult && !selectedHistoryAttempt
  const currentQuestionSource = selectedHistoryAttempt?.detalii || quizQuestions
  const currentQuestion = currentQuestionSource[currentQuestionIndex]

  return {
    isStudent,
    selectedCourseId,
    setSelectedCourseId,
    ...generation,
    ...history,
    timeLeft,
    setTimeLeft,
    courses,
    accessibleDocuments,
    isLoadingDocs,
    themePickerOpen,
    setThemePickerOpen,
    themePickerRef,
    selectedThemeKey,
    handleThemeChange,
    handleStartQuiz,
    handleAnswerClick,
    handleFinalizeQuiz,
    handleResetQuiz,
    answeredCount,
    isQuizReadyToFinalize,
    currentQuestion,
  }
}
