import apiClient from "@/api/client"

import type { AuthUser } from "@/types/user"

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const

export async function getAuthenticatedUser() {
  const response = await apiClient.get<AuthUser>("/api/auth/me")
  return response.data as AuthUser
}
