import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getDetaliuQuizStudent, getIstoricQuizStudent, stergeIncercareQuiz } from "@/features/study-tools/api/studyTools"

import type { QuizAttemptDetail, QuizAttemptHistoryItem } from "@/features/study-tools/quiz/quiz.types"
import type { AppAxiosError } from "@/types/api"

export function useQuizHistory(selectedCourseId: string) {
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<QuizAttemptDetail | null>(null)
  const [isLoadingHistoryDetail, setIsLoadingHistoryDetail] = useState(false)
  const [historyError, setHistoryError] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)

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

  const deleteQuizAttemptMutation = useMutation({
    mutationFn: stergeIncercareQuiz,
  })

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

  return {
    selectedHistoryAttempt,
    setSelectedHistoryAttempt,
    isLoadingHistoryDetail,
    historyError,
    setHistoryError,
    historyOpen,
    setHistoryOpen,
    quizHistory,
    isLoadingHistory,
    refetchQuizHistory,
    handleStergeQuiz,
    handleViewAttemptDetail,
  }
}
