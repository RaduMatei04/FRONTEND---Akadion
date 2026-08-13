import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { listStudentCourses } from "@/features/courses/api/courses"
import { finalizeazaQuiz, genereazaQuiz, getDetaliuQuizStudent, getDocumenteAccesibile, getIstoricQuizStudent, stergeIncercareQuiz } from "@/features/study-tools/api/studyTools"
import { QUIZ_COURSES_QUERY_KEY } from "@/features/study-tools/quiz/quiz.constants"
import { AccessibleDocument, CourseOption, QuizAttemptDetail, QuizAttemptHistoryItem, QuizGenerationResponse, QuizQuestionRecord, QuizResultRecord } from "@/features/study-tools/quiz/quiz.types"
import { useStoredPageTheme } from "@/features/study-tools/lib/pageThemeStorage"
import { isStudentUser } from "@/lib/user"

import type { AppAxiosError } from "@/types/api"

export function useQuizController() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isStudent = isStudentUser(user)

  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedQuizDocId, setSelectedQuizDocId] = useState("")
  const [quizNumQuestions, setQuizNumQuestions] = useState(5)
  const [quizDifficulty, setQuizDifficulty] = useState("MEDIU")
  const [quizMode, setQuizMode] = useState("EXERSARE")
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionRecord[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, { selectedOption: string }>>({})
  const [currentIncercareId, setCurrentIncercareId] = useState<string | number | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResultRecord | null>(null)
  const [quizError, setQuizError] = useState("")
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<QuizAttemptDetail | null>(null)
  const [isLoadingHistoryDetail, setIsLoadingHistoryDetail] = useState(false)
  const [historyError, setHistoryError] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)
  const { selectedThemeKey, setSelectedThemeKey } = useStoredPageTheme(user, "akadion:quiz-page-theme")

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

  const {
    data: quizHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchQuizHistory,
  } = useQuery<QuizAttemptHistoryItem[]>({
    queryKey: ["quiz", "history", selectedCourseId || null, historyOpen],
    queryFn: async () => {
      const response = await getIstoricQuizStudent(selectedCourseId || null)
      return Array.isArray(response) ? response : (response?.content || response?.continut || [])
    },
    enabled: historyOpen,
  })

  const generateQuizMutation = useMutation({
    mutationFn: ({ courseId, documentId, count, difficulty }: { courseId: string; documentId: string; count: number; difficulty: string }) =>
      genereazaQuiz(courseId, {
        documentId: documentId ? Number(documentId) : null,
        nrIntrebari: count,
        dificultate: difficulty,
      }),
  })

  const finalizeQuizMutation = useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string | number; answers: { index: number; raspunsStudent: string | null }[] }) =>
      finalizeazaQuiz(attemptId, answers),
  })

  const deleteQuizAttemptMutation = useMutation({
    mutationFn: stergeIncercareQuiz,
  })

  const autoFinalizeRef = useRef<null | (() => Promise<void>)>(null)

  autoFinalizeRef.current = async () => {
    if (!currentIncercareId || finalizeQuizMutation.isPending) {
      return
    }

    setQuizError("Timpul a expirat. Quiz-ul se finalizează automat...")

    try {
      const payload = quizQuestions.map((question, index) => ({
        index: question.index ?? index,
        raspunsStudent: answeredQuestions[index]?.selectedOption || null,
      }))
      const response = await finalizeQuizMutation.mutateAsync({ attemptId: currentIncercareId, answers: payload })
      setQuizResult(response)
      await refetchQuizHistory()
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      setQuizError(typedError.response?.data?.eroare || String(typedError.response?.data?.detail || "") || "Nu s-a putut finaliza automat quiz-ul.")
    }
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
  }, [searchParams])

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
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setAnsweredQuestions({})
    setQuizResult(null)
    setCurrentIncercareId(null)
    setQuizError("")
    setTimeLeft(0)
    setSelectedHistoryAttempt(null)
    setHistoryError("")
  }, [selectedCourseId])

  useEffect(() => {
    if (quizQuestions.length === 0 || quizResult || quizMode !== "EXAMEN") {
      return undefined
    }

    setTimeLeft(quizQuestions.length * 15)
    const intervalId = window.setInterval(() => {
      setTimeLeft((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(intervalId)
          autoFinalizeRef.current?.()
          return 0
        }
        return currentValue - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [quizMode, quizQuestions, quizResult])

  function handleThemeChange(themeKey: string) {
    setSelectedThemeKey(themeKey)
    setThemePickerOpen(false)
  }

  async function handleStartQuiz() {
    if (!selectedCourseId) {
      return
    }

    setQuizError("")
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setAnsweredQuestions({})
    setCurrentIncercareId(null)
    setQuizResult(null)
    setTimeLeft(0)
    setSelectedHistoryAttempt(null)

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
      const typedError = error as AppAxiosError
      setQuizError(typedError.response?.data?.eroare || String(typedError.response?.data?.detail || "") || "Nu am putut genera quiz-ul.")
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

    try {
      const payload = quizQuestions.map((question, index) => ({
        index: question.index ?? index,
        raspunsStudent: answeredQuestions[index]?.selectedOption || null,
      }))
      const response = await finalizeQuizMutation.mutateAsync({ attemptId: currentIncercareId, answers: payload })
      setQuizResult(response)
      await refetchQuizHistory()
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      setQuizError(typedError.response?.data?.eroare || String(typedError.response?.data?.detail || "") || "Nu am putut finaliza quiz-ul.")
    }
  }

  function handleResetQuiz() {
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setAnsweredQuestions({})
    setQuizError("")
    setCurrentIncercareId(null)
    setQuizResult(null)
    setTimeLeft(0)
    setSelectedHistoryAttempt(null)
  }

  async function handleStergeQuiz(incercareId: string | number) {
    if (!window.confirm("Sigur dorești să ștergi acest quiz din istoric?")) {
      return
    }

    try {
      await deleteQuizAttemptMutation.mutateAsync(incercareId)
      if (selectedHistoryAttempt?.incercareId === incercareId) {
        setSelectedHistoryAttempt(null)
      }
      await refetchQuizHistory()
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      console.error("Nu s-a putut șterge încercarea de quiz", error)
      setHistoryError(typedError.response?.data?.eroare || "Nu s-a putut șterge încercarea.")
    }
  }

  async function handleViewAttemptDetail(item: QuizAttemptHistoryItem | string | number) {
    const incercareId = typeof item === "object" ? (item.incercareId || item.id) : item
    const historyItem = typeof item === "object" ? item : null
    if (!incercareId) {
      return
    }

    setIsLoadingHistoryDetail(true)
    setHistoryError("")
    setSelectedHistoryAttempt({
      incercareId,
      cursDenumire: historyItem?.cursDenumire || "",
      documentTitlu: historyItem?.documentTitlu || "",
      scor: historyItem?.scor || 0,
      nrIntrebari: historyItem?.nrIntrebari || 0,
      procentaj: historyItem?.procentaj || 0,
      detalii: [],
    })

    try {
      const detail = await getDetaliuQuizStudent(incercareId)
      setSelectedHistoryAttempt(detail)
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      console.error("Nu s-a putut încărca detaliul încercării", error)
      setHistoryError(typedError.response?.data?.eroare || "Nu s-a putut încărca detaliul încercării.")
    } finally {
      setIsLoadingHistoryDetail(false)
    }
  }

  const answeredCount = Object.keys(answeredQuestions).length
  const isQuizReadyToFinalize = quizQuestions.length > 0 && answeredCount === quizQuestions.length && !quizResult && !selectedHistoryAttempt
  const currentQuestionSource = selectedHistoryAttempt?.detalii || quizQuestions
  const currentQuestion = currentQuestionSource[currentQuestionIndex]

  return {
    isStudent,
    selectedCourseId,
    setSelectedCourseId,
    selectedQuizDocId,
    setSelectedQuizDocId,
    quizNumQuestions,
    setQuizNumQuestions,
    quizDifficulty,
    setQuizDifficulty,
    quizMode,
    setQuizMode,
    timeLeft,
    setTimeLeft,
    quizQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answeredQuestions,
    currentIncercareId,
    quizResult,
    quizError,
    setQuizError,
    selectedHistoryAttempt,
    setSelectedHistoryAttempt,
    isLoadingHistoryDetail,
    historyError,
    setHistoryError,
    historyOpen,
    setHistoryOpen,
    themePickerOpen,
    setThemePickerOpen,
    themePickerRef,
    selectedThemeKey,
    courses,
    accessibleDocuments,
    isLoadingDocs,
    quizHistory,
    isLoadingHistory,
    refetchQuizHistory,
    generateQuizMutation,
    finalizeQuizMutation,
    handleThemeChange,
    handleStartQuiz,
    handleAnswerClick,
    handleFinalizeQuiz,
    handleResetQuiz,
    handleStergeQuiz,
    handleViewAttemptDetail,
    answeredCount,
    isQuizReadyToFinalize,
    currentQuestion,
  }
}
