import apiClient from "@/api/client"

import type { AuthUser } from "@/types/user"

export interface UpdateMyProfilePayload {
  nume?: string
  prenume?: string
  facultate?: string
  [key: string]: unknown
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  const response = await apiClient.put<AuthUser>("/api/auth/me", payload)
  return response.data
}

export async function updateMyEmail(email: string) {
  const response = await apiClient.put<AuthUser | null>("/api/auth/me/email", { newEmail: email })
  return response.data
}

export async function requestMyPasswordReset() {
  const response = await apiClient.post("/api/auth/me/request-password-reset")
  return response.data
}
