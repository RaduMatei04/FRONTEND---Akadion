import type { CSSProperties } from "react"

import type { ApiError } from "@/types/api"

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
  const typedError = error as ApiError
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

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function roundAlpha(value: number) {
  return Math.round(value * 1000) / 1000
}

function parseHexColor(hexColor: string) {
  const normalizedHex = hexColor.trim().replace("#", "")
  const fullHex = normalizedHex.length === 3
    ? normalizedHex.split("").map((value) => `${value}${value}`).join("")
    : normalizedHex

  if (!/^[\da-fA-F]{6}$/.test(fullHex)) {
    return null
  }

  return {
    red: Number.parseInt(fullHex.slice(0, 2), 16),
    green: Number.parseInt(fullHex.slice(2, 4), 16),
    blue: Number.parseInt(fullHex.slice(4, 6), 16),
  }
}

function getQuizScoreRatio(score: number | null | undefined, totalQuestions: number | null | undefined, percentage: number | null | undefined) {
  if (typeof score === "number" && typeof totalQuestions === "number" && totalQuestions > 0) {
    return clampValue(score / totalQuestions, 0, 1)
  }

  if (typeof percentage === "number") {
    return clampValue(percentage / 100, 0, 1)
  }

  return 0
}

export function getScoreBadgeStyle(themeColor: string, score: number | null | undefined, totalQuestions: number | null | undefined, percentage: number | null | undefined): CSSProperties {
  const rgb = parseHexColor(themeColor)
  if (!rgb) {
    return {}
  }

  const scoreRatio = getQuizScoreRatio(score, totalQuestions, percentage)
  const backgroundAlpha = 0.18 + scoreRatio * 0.82
  const borderAlpha = 0.32 + scoreRatio * 0.68
  const textAlpha = 0.86 + scoreRatio * 0.14
  const useLightText = scoreRatio >= 0.72

  return {
    backgroundColor: `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${roundAlpha(backgroundAlpha)})`,
    borderColor: `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${roundAlpha(borderAlpha)})`,
    color: useLightText
      ? "#ffffff"
      : `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${roundAlpha(textAlpha)})`,
  }
}
