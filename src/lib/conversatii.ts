import apiClient from "@/api/client"

import type { PaginatedResponse } from "@/types/api"
import type { AkyMessage, Conversatie } from "@/types/chat"
import type { Flashcard, QuizAttempt, QuizResult } from "@/types/quiz"

interface QuizGenerationPayload {
  documentId?: string | number | null
  nrIntrebari?: number
  dificultate?: string
}

type DocumentAccesibil = Record<string, unknown>
type QuizDetaliu = Record<string, unknown>
type QuizRaspunsuri = unknown[]

export async function getConversatiiGlobale(page = 0, size = 20): Promise<PaginatedResponse<Conversatie> | Conversatie[]> {
  const response = await apiClient.get<PaginatedResponse<Conversatie> | Conversatie[]>(`/api/conversatii`, { params: { page, size } })
  return response.data as PaginatedResponse<Conversatie> | Conversatie[]
}

export async function getConversatii(cursId: string | number, page = 0, size = 20): Promise<PaginatedResponse<Conversatie> | Conversatie[]> {
  const response = await apiClient.get<PaginatedResponse<Conversatie> | Conversatie[]>(`/api/cursuri/${cursId}/conversatii`, { params: { page, size } })
  return response.data as PaginatedResponse<Conversatie> | Conversatie[]
}

export async function creareConversatieSiMesaj(cursId: string | number, intrebare: string): Promise<Conversatie | AkyMessage | Record<string, unknown>> {
  const response = await apiClient.post<Conversatie | AkyMessage | Record<string, unknown>>(`/api/cursuri/${cursId}/conversatii/mesaje`, {
    intrebare
  })
  return response.data as Conversatie | AkyMessage | Record<string, unknown>
}

export async function getIstoric(conversatieId: string | number, inainteDe: string | number | null = null, limit = 20): Promise<PaginatedResponse<AkyMessage> | AkyMessage[]> {
  const params: { limit: number; inainteDe?: string | number } = { limit }
  if (inainteDe) params.inainteDe = inainteDe
  const response = await apiClient.get<PaginatedResponse<AkyMessage> | AkyMessage[]>(`/api/conversatii/${conversatieId}/mesaje`, { params })
  return response.data as PaginatedResponse<AkyMessage> | AkyMessage[]
}

export async function adaugaMesaj(conversatieId: string | number, intrebare: string): Promise<AkyMessage | Record<string, unknown>> {
  const response = await apiClient.post<AkyMessage | Record<string, unknown>>(`/api/conversatii/${conversatieId}/mesaje`, { intrebare })
  return response.data as AkyMessage | Record<string, unknown>
}

export async function retryMesaj(mesajId: string | number): Promise<AkyMessage | Record<string, unknown>> {
  const response = await apiClient.post<AkyMessage | Record<string, unknown>>(`/api/conversatii/mesaje/${mesajId}/retry`)
  return response.data as AkyMessage | Record<string, unknown>
}

export async function stergeConversatie(conversatieId: string | number): Promise<void> {
  await apiClient.delete(`/api/conversatii/${conversatieId}`)
}

export async function getDocumenteAccesibile(cursId: string | number): Promise<DocumentAccesibil[]> {
  const response = await apiClient.get<DocumentAccesibil[]>(`/api/student/cursuri/${cursId}/documente-accesibile`)
  return response.data as DocumentAccesibil[]
}

export async function genereazaQuiz(cursId: string | number, { documentId = null, nrIntrebari = 5, dificultate = "MEDIU" }: QuizGenerationPayload = {}): Promise<Record<string, unknown>> {
  const response = await apiClient.post<Record<string, unknown>>(`/api/student/cursuri/${cursId}/quiz/generate`, {
    documentId,
    nrIntrebari,
    dificultate,
  })
  return response.data as Record<string, unknown>
}

export async function genereazaFlashcards(cursId: string | number, documentId: string | number | null = null, nrFlashcards = 5): Promise<Flashcard[] | Record<string, unknown>> {
  const response = await apiClient.post<Flashcard[] | Record<string, unknown>>(`/api/student/cursuri/${cursId}/flashcards/generate`, {
    documentId,
    nrFlashcards,
  })
  return response.data as Flashcard[] | Record<string, unknown>
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
  const response = await apiClient.get<PaginatedResponse<QuizAttempt> | QuizAttempt[]>(`/api/student/quiz/istoric`, { params })
  return response.data as PaginatedResponse<QuizAttempt> | QuizAttempt[]
}

export async function getDetaliuQuizStudent(incercareId: string | number): Promise<QuizDetaliu> {
  const response = await apiClient.get<QuizDetaliu>(`/api/student/quiz/istoric/${incercareId}`)
  return response.data as QuizDetaliu
}

export async function stergeIncercareQuiz(incercareId: string | number): Promise<void> {
  await apiClient.delete(`/api/student/quiz/${incercareId}`)
}
