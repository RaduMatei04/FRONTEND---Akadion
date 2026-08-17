import apiClient from "@/api/client"

import type { PaginatedResponse } from "@/types/api"
import type { AkyMessage, Conversatie } from "@/features/aky-chat/aky-chat.types"

export async function getConversatiiGlobale(page = 0, size = 20): Promise<PaginatedResponse<Conversatie> | Conversatie[]> {
  const response = await apiClient.get<PaginatedResponse<Conversatie> | Conversatie[]>("/api/conversatii", { params: { page, size } })
  return response.data as PaginatedResponse<Conversatie> | Conversatie[]
}

export async function getConversatii(cursId: string | number, page = 0, size = 20): Promise<PaginatedResponse<Conversatie> | Conversatie[]> {
  const response = await apiClient.get<PaginatedResponse<Conversatie> | Conversatie[]>(`/api/cursuri/${cursId}/conversatii`, { params: { page, size } })
  return response.data as PaginatedResponse<Conversatie> | Conversatie[]
}

export async function creareConversatieSiMesaj(cursId: string | number, intrebare: string): Promise<Conversatie | AkyMessage | Record<string, unknown>> {
  const response = await apiClient.post<Conversatie | AkyMessage | Record<string, unknown>>(`/api/cursuri/${cursId}/conversatii/mesaje`, {
    intrebare,
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
