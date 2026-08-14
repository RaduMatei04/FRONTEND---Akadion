import type { AppAxiosError } from "@/types/api"

import type { QuizQuestionRecord } from "./quiz.types"

export function buildQuizAnswersPayload(
  quizQuestions: QuizQuestionRecord[],
  answeredQuestions: Record<number, { selectedOption: string }>,
) {
  return quizQuestions.map((question, index) => ({
    index: question.index ?? index,
    raspunsStudent: answeredQuestions[index]?.selectedOption || null,
  }))
}

export function getQuizErrorMessage(error: unknown, fallback: string) {
  const typedError = error as AppAxiosError
  return typedError.response?.data?.eroare || String(typedError.response?.data?.detail || "") || fallback
}

export function getQuizOptionEntries(optiuni: unknown) {
  if (Array.isArray(optiuni)) {
    return optiuni.map((value, index) => [String.fromCharCode(65 + index), value])
  }
  if (optiuni && typeof optiuni === "object") {
    return Object.entries(optiuni)
  }
  return []
}

export function formatQuizDate(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function normalizeQuizAnswerValue(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

export function quizAnswerMatchesOption(answer: unknown, optionKey: unknown, optionValue: unknown) {
  const normalizedAnswer = normalizeQuizAnswerValue(answer)
  if (!normalizedAnswer) {
    return false
  }

  return normalizedAnswer === normalizeQuizAnswerValue(optionKey)
    || normalizedAnswer === normalizeQuizAnswerValue(optionValue)
}

export function getScoreBadgeClasses(procentaj: number) {
  if (procentaj >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (procentaj >= 50) return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-rose-200 bg-rose-50 text-rose-700"
}
