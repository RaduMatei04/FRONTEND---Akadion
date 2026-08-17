import apiClient from "@/api/client"

import type { PaginatedResponse } from "@/types/api"
import type { AccessibleDocument, QuizAttempt, QuizResult } from "@/features/study-tools/quiz/quiz.types"

interface QuizGenerationPayload {
  documentId?: string | number | null
  nrIntrebari?: number
  dificultate?: string
}

type QuizDetaliu = Record<string, unknown>
type QuizRaspunsuri = unknown[]

export async function getDocumenteAccesibile(cursId: string | number): Promise<AccessibleDocument[]> {
  const response = await apiClient.get<AccessibleDocument[]>(`/api/student/cursuri/${cursId}/documente-accesibile`)
  return response.data as AccessibleDocument[]
}

export async function genereazaQuiz(cursId: string | number, { documentId = null, nrIntrebari = 5, dificultate = "MEDIU" }: QuizGenerationPayload = {}): Promise<Record<string, unknown>> {
  const response = await apiClient.post<Record<string, unknown>>(`/api/student/cursuri/${cursId}/quiz/generate`, {
    documentId,
    nrIntrebari,
    dificultate,
  })
  return response.data as Record<string, unknown>
}

export async function finalizeazaQuiz(incercareId: string | number, raspunsuri: QuizRaspunsuri): Promise<QuizResult | Record<string, unknown>> {
  const response = await apiClient.post<QuizResult | Record<string, unknown>>(`/api/student/quiz/${incercareId}/finalizeaza`, {
    raspunsuri,
  })
  return response.data as QuizResult | Record<string, unknown>
}

export async function getIstoricQuizStudent(cursId: string | number | null = null, page = 0, size = 20): Promise<PaginatedResponse<QuizAttempt> | QuizAttempt[]> {
  const params: { page: number; size: number; cursId?: string | number } = { page, size }
  if (cursId) {
    params.cursId = cursId
  }
  const response = await apiClient.get<PaginatedResponse<QuizAttempt> | QuizAttempt[]>("/api/student/quiz/istoric", { params })
  return response.data as PaginatedResponse<QuizAttempt> | QuizAttempt[]
}

export async function getDetaliuQuizStudent(incercareId: string | number): Promise<QuizDetaliu> {
  const response = await apiClient.get<QuizDetaliu>(`/api/student/quiz/istoric/${incercareId}`)
  return response.data as QuizDetaliu
}

export async function stergeIncercareQuiz(incercareId: string | number): Promise<void> {
  await apiClient.delete(`/api/student/quiz/${incercareId}`)
}
