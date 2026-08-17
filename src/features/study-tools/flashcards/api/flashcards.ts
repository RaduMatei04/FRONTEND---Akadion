import apiClient from "@/api/client"

import type { Flashcard } from "@/features/study-tools/flashcards/flashcards.types"

export async function genereazaFlashcards(cursId: string | number, documentId: string | number | null = null, nrFlashcards = 5): Promise<Flashcard[] | Record<string, unknown>> {
  const response = await apiClient.post<Flashcard[] | Record<string, unknown>>(`/api/student/cursuri/${cursId}/flashcards/generate`, {
    documentId,
    nrFlashcards,
  })
  return response.data as Flashcard[] | Record<string, unknown>
}
