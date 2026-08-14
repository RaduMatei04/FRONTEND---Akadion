import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

import { finalizeazaQuiz, genereazaQuiz } from "@/features/study-tools/api/studyTools"

import type { QuizQuestionRecord, QuizResultRecord } from "@/features/study-tools/quiz/quiz.types"

interface GenerateQuizParams {
  courseId: string
  documentId: string
  count: number
  difficulty: string
}

interface FinalizeQuizParams {
  attemptId: string | number
  answers: { index: number; raspunsStudent: string | null }[]
}

export function useQuizGeneration() {
  const [selectedQuizDocId, setSelectedQuizDocId] = useState("")
  const [quizNumQuestions, setQuizNumQuestions] = useState(5)
  const [quizDifficulty, setQuizDifficulty] = useState("MEDIU")
  const [quizMode, setQuizMode] = useState("EXERSARE")
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionRecord[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, { selectedOption: string }>>({})
  const [currentIncercareId, setCurrentIncercareId] = useState<string | number | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResultRecord | null>(null)
  const [quizError, setQuizError] = useState("")

  const generateQuizMutation = useMutation({
    mutationFn: ({ courseId, documentId, count, difficulty }: GenerateQuizParams) =>
      genereazaQuiz(courseId, {
        documentId: documentId ? Number(documentId) : null,
        nrIntrebari: count,
        dificultate: difficulty,
      }),
  })

  const finalizeQuizMutation = useMutation({
    mutationFn: ({ attemptId, answers }: FinalizeQuizParams) => finalizeazaQuiz(attemptId, answers),
  })

  return {
    selectedQuizDocId,
    setSelectedQuizDocId,
    quizNumQuestions,
    setQuizNumQuestions,
    quizDifficulty,
    setQuizDifficulty,
    quizMode,
    setQuizMode,
    quizQuestions,
    setQuizQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answeredQuestions,
    setAnsweredQuestions,
    currentIncercareId,
    setCurrentIncercareId,
    quizResult,
    setQuizResult,
    quizError,
    setQuizError,
    generateQuizMutation,
    finalizeQuizMutation,
  }
}
